import { NextFunction, Request, Response, RequestHandler } from "express";
import { RequestHandlerParams } from "express-serve-static-core";
import JwtRedisSessionHandler from "./jwt_session";

export class ApiAcl {

    static requestKey = 'jwtSession';
    static requestArg = 'requestArg';

    protected jwtRedisSessionHandler: JwtRedisSessionHandler;

    protected redisClient;

    constructor() {
        let redis = require('redis');

        const secret = process.env.JWT_SECRET;
        const redisClient = redis.createClient({
            host: process.env.REDIS_HOST
        });

        this.jwtRedisSessionHandler = new JwtRedisSessionHandler({
            client: redisClient,
            secret: secret,
            keyspace: "sess:", 
            maxAge: 60 * 60 * 24 * 3, // 3 days
            algorithm: "HS256",
            requestKey: ApiAcl.requestKey,
            requestArg: ApiAcl.requestArg
        });
    }

    public execute(requiredModules: Array<string>): Function {
        return async (req: Request, res: Response, next: NextFunction) => {
            this.jwtRedisSessionHandler.processReq(req);
            if (!req.hasOwnProperty(ApiAcl.requestKey)) {
                return res.status(401).json({'errors': ['Not authenticated.']}).end();
            }
            if (requiredModules.length > 0) {
                for (let userModule in req[ApiAcl.requestKey].roles) {
                    if (requiredModules.indexOf(userModule)) {
                        return next();
                    }
                }
            } else {
                return next();
            }
            return res.status(403).json({'errors': ['No privilege.']}).end();
        };
    }
}