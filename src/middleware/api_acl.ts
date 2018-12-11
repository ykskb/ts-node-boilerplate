import { NextFunction, Request, Response, RequestHandler } from "express"   
import JwtRedisSessionHandler from "./jwt_session"
import { Service, Container } from "typedi"
import { JwtRedisSessionHandlerProvider } from "../providers/jwt";

@Service()
export class ApiAcl {

    static sessionKey = 'session'
    static tokenArg = 'token'
    static headerArg = 'authorization'

    protected jwtRedisSessionHandler: JwtRedisSessionHandler

    constructor() {
        this.jwtRedisSessionHandler = Container.get(JwtRedisSessionHandlerProvider).provide()
    }

    public execute(requiredModules: Array<string>): Function {
        return async (req: Request, res: Response, next: NextFunction) => {
            await this.jwtRedisSessionHandler.processReq(req)
            if (!req.hasOwnProperty(ApiAcl.sessionKey)) {
                return res.status(401).json({ 'errors': ['Not authenticated.'] }).end()
            }
            if (requiredModules.length < 1) {
                return next()
            }
            if (req[ApiAcl.sessionKey].user && req[ApiAcl.sessionKey].user.role && req[ApiAcl.sessionKey].user.role.role_modules) {
                const userModules = req[ApiAcl.sessionKey].user.role.role_modules.map(o => o["module"])
                for (let i = 0; i < userModules.length; i++) {
                    if (requiredModules.indexOf(userModules[i]) > -1) {
                        return next()
                    }
                }
            }
            return res.status(403).json({ 'errors': ['No privilege.'] }).end()
        }
    }
}