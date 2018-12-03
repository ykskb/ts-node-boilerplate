import * as _ from "lodash";
import * as jwt from "jsonwebtoken";
import * as uuid from "uuid/v4";
import {inspect} from "util";

export default class JwtRedisSessionHandler {

    protected options: any;

    constructor(options: any) {
        this.options = {
            client: options.client,
            secret: options.secret,
            algorithm: options.algorithm || "HS256",
            keyspace: options.keyspace || "sess:",
            maxAge: options.maxAge || 86400,
            requestKey: options.requestKey || "session",
            requestArg: options.requestArg || "accessToken"
        };
    }

    protected requestHeader() {
        return _.reduce(this.options.requestArg.split(""), (memo, ch) => {
            return memo + (ch.toUpperCase() === ch ? "-" + ch.toLowerCase() : ch);
        }, "x" + (this.options.requestArg.charAt(0) === this.options.requestArg.charAt(0).toUpperCase() ? "" : "-"));
    }

    public processReq(req) {
        req[this.options.requestKey] = new JwtRedisSession(this.options);

        var token = req.get(this.requestHeader())
            || req.query[this.options.requestArg]
            || (req.body && req.body[this.options.requestArg]);

        if (token) {
            jwt.verify(token, this.options.secret, function (error, decoded) {
                if (error || !decoded.jti)
                    return;

                this.options.client.get(this.options.keyspace + decoded.jti, (err, session) => {
                    if (err || !session)
                        return;

                    try {
                        session = JSON.parse(session);
                    } catch (e) {
                        return;
                    }

                    _.extend(req[this.options.requestKey], session);
                    req[this.options.requestKey].claims = decoded;
                    req[this.options.requestKey].id = decoded.jti;
                    req[this.options.requestKey].jwt = token;
                    // Update the TTL
                    req[this.options.requestKey].touch(_.noop);
                });
            });
        }
    }
}

export class JwtRedisSession {

    protected sessionId: string;

    protected options: any;

    constructor(options: any) {
        this.options = options;
    }

    public create(claims, callback: Function) {
        if (typeof claims === "function" && !callback) {
            callback = claims;
            claims = {};
        }
        const self = this,
            sid = uuid();
        const token = jwt.sign(_.extend({ jti: sid }, claims || {}), this.options.secret, { algorithm: this.options.algorithm });
        this.options.client.setex(this.options.keyspace + sid, this.options.maxAge, JSON.stringify(inspect(this.serializeSession(this))), function (error) {
            this.sessionId = sid;
            callback(error, token);
        });
    }

    public touch(callback: Function) {
        if (!this.sessionId) {
            return process.nextTick(function () {
                callback(new Error("Invalid session ID"));
            });
        }
        this.options.client.expire(this.options.keyspace + this.sessionId, this.options.maxAge, callback);
    }

    public update(callback: Function) {
        if (!this.sessionId) {
            return process.nextTick(function () {
                callback(new Error("Invalid session ID"));
            });
        }
        this.options.client.setex(this.options.keyspace + this.sessionId, this.options.maxAge, JSON.stringify(this.serializeSession(this)), callback);
    }

    public reload(callback: Function) {
        if (!this.sessionId) {
            return process.nextTick(function () {
                callback(new Error("Invalid session ID"));
            });
        }
        this.options.client.get(this.options.keyspace + this.sessionId, function (error, resp) {
            if (error)
                return callback(error);
            try {
                resp = JSON.parse(resp);
            } catch (e) {
                return callback(e);
            }
            this.extendSession(self, resp);
            callback();
        })
    }

    public destroy(callback: Function) {
        if (!this.sessionId) {
            return process.nextTick(function () {
                callback(new Error("Invalid session ID"));
            });
        }
        this.options.client.del(this.options.keyspace + this.sessionId, callback);
    }

    public toJson() {
        return this.serializeSession(this);
    }

    protected serializeSession(session) {
        return _.reduce(session, function (memo, val, key) {
            if (typeof val !== "function" && key !== "id")
                memo[key] = val;
            return memo;
        }, {});
    }

    protected extendSession(session, data) {
        _.reduce(data, function (memo, val, key) {
            if (typeof val !== "function" && key !== "id")
                memo[key] = val;
            return memo;
        }, session);
    }
}