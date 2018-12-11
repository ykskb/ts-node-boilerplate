import * as _ from "lodash"
import * as jwt from "jsonwebtoken"
import * as uuid from "uuid/v4"
import Container, { Service } from "typedi"
import * as circularJson from "circular-json"
import {authConfig} from "../config/auth"
import { redisClientProvider } from "../providers/redis";
import { RedisClient, createClient } from "redis";

@Service()
export default class JwtRedisSessionHandler {

    protected options: any

    constructor(options: any) {
        this.options = {
            secret: options.secret,
            algorithm: options.algorithm || "HS256",
            keyspace: options.keyspace || "sess:",
            maxAge: options.maxAge || 86400,
            sessionKey: options.sessionName || "session",
            headerArg: options.headerArg || "authorization",
            requestArg: options.requestArg || "token"
        }
    }

    protected headerToken(req) {
        if (req['headers'][this.options.headerArg]) {
            const val: string = req['headers'][this.options.headerArg]
            const tokenIndex: number = val.indexOf(this.options.requestArg)
            if (tokenIndex === -1) return null
            const valIndex: number = tokenIndex + this.options.requestArg.length + 1;
            return val.substr(valIndex).trim()
        }
        return null
    }

    protected sessionToken(req) {
        return req.cookies[authConfig.sessionCookieName] ? req.cookies[authConfig.sessionCookieName] : null
    }

    public async processReq(req) {
        req[this.options.sessionKey] = new JwtRedisSession(this.options)

        var token = this.headerToken(req)
            || this.sessionToken(req)
            || req.query[this.options.requestArg]
            || (req.body && req.body[this.options.requestArg])

        if (token) {
            let verifyPromise = async () => {
                return await jwt.verify(token, this.options.secret, (error, decoded) => {
                    if (error || !decoded.jti) return null
                    return decoded
                })
            }
            let handleSessionPromise = (decoded) => {
                return new Promise((resolve, reject) => {
                    const redisClient = Container.get(redisClientProvider).provide()
                    redisClient.get(this.options.keyspace + decoded.jti, (err, session) => {
                        if (err || !session)
                            return reject()
                        let sessionData: Object
                        try {
                            sessionData = circularJson.parse(session)
                        } catch (e) {
                            console.log(e)
                            return reject()
                        }
                        _.extend(req[this.options.sessionKey], sessionData)
                        req[this.options.sessionKey].claims = decoded
                        req[this.options.sessionKey].id = decoded.jti
                        req[this.options.sessionKey].jwt = token
                        // Update the TTL
                        req[this.options.sessionKey].touch(_.noop)
                        return resolve()
                    })
                })
            }
            const decoded = await verifyPromise()
            if (decoded) {
                await handleSessionPromise(decoded).then(() => { return })
            }
        }
    }
}

class JwtRedisSession {

    protected sessionId: string

    protected options: any

    constructor(options: any) {
        this.options = options
    }

    public create(claims, callback: Function) {
        if (typeof claims === "function" && !callback) {
            callback = claims
            claims = {}
        }
        const self = this, sid = uuid()
        const token = jwt.sign(_.extend({ jti: sid }, claims || {}), this.options.secret, { algorithm: this.options.algorithm })
        this.sessionId = sid
        const redisClient = Container.get(redisClientProvider).provide()
        redisClient.setex(this.options.keyspace + sid, this.options.maxAge, circularJson.stringify(this.serializeSession(this)), function (error) {
            callback(error, token)
        })
    }

    public touch(callback: Function) {
        if (!this.sessionId) {
            return process.nextTick(function () {
                callback(new Error("Invalid session ID"))
            })
        }
        const redisClient = Container.get(redisClientProvider).provide()
        redisClient.expire(this.options.keyspace + this.sessionId, this.options.maxAge)
    }

    public update(callback: Function) {
        if (!this.sessionId) {
            return process.nextTick(function () {
                callback(new Error("Invalid session ID"))
            })
        }
        const redisClient = Container.get(redisClientProvider).provide()
        redisClient.setex(this.options.keyspace + this.sessionId, this.options.maxAge, circularJson.stringify(this.serializeSession(this)))
    }

    public reload(callback: Function) {
        if (!this.sessionId) {
            return process.nextTick(function () {
                callback(new Error("Invalid session ID"))
            })
        }
        const redisClient = Container.get(redisClientProvider).provide()
        redisClient.get(this.options.keyspace + this.sessionId, function (error, resp) {
            if (error)
                return callback(error)
            try {
                resp = JSON.parse(resp)
            } catch (e) {
                return callback(e)
            }
            this.extendSession(self, resp)
            callback()
        })
    }

    public destroy(callback: Function) {
        if (!this.sessionId) {
            return process.nextTick(function () {
                callback(new Error("Invalid session ID"))
            })
        }
        const redisClient = Container.get(redisClientProvider).provide()
        redisClient.del(this.options.keyspace + this.sessionId)
    }

    public toJson() {
        return this.serializeSession(this)
    }

    protected serializeSession(session) {
        return _.reduce(session, function (memo, val, key) {
            if (typeof val !== "function" && key !== "id" && key !== "options")
                memo[key] = val
            return memo
        }, {})
    }

    protected extendSession(session, data) {
        _.reduce(data, function (memo, val, key) {
            if (typeof val !== "function" && key !== "id")
                memo[key] = val
            return memo
        }, session)
    }
}