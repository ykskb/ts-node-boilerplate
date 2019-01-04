import { NextFunction, Request, Response, RequestHandler } from "express"
import JwtRedisSessionHandler from "./jwt_session"
import Container, { Service } from "typedi"
import { AuthRoute } from "../routes/admin/auth";
import { JwtRedisSessionHandlerProvider } from "../providers/jwt";
import { authConfig } from "../config/auth";

@Service()
export class WebAcl {
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
            if (!req.hasOwnProperty(WebAcl.sessionKey)) {
                return res.redirect(AuthRoute.signinPath + "?error=not-authenticated")
            }
            if (requiredModules.length < 1) {
                return next()
            }
            if (req[WebAcl.sessionKey].user && req[WebAcl.sessionKey].user.role && req[WebAcl.sessionKey].user.role.role_modules) {
                const userModules = req[WebAcl.sessionKey].user.role.role_modules.map(o => o["module"])
                for (let i = 0; i < userModules.length; i++) {
                    if (requiredModules.indexOf(userModules[i]) > -1) {
                        return next()
                    }
                }
            }
            res.clearCookie(authConfig.sessionCookieName)
            return res.redirect(AuthRoute.signinPath + "?error=no-privilege")
        }
    }
}