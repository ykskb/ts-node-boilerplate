import { NextFunction, Request, Response, Router } from "express"
import { BaseRoute } from "./base"
import validator from "validator"
import Container, { Service } from "typedi"
import { UserRepository } from "../../repositories/UserRepository"
import * as bcrypt from "bcryptjs"
import { WebAcl } from "../../middleware/web_acl"
import { IndexRoute } from ".";
import { authConfig } from "../../config/auth"
import { appConfig } from "../../config/app";

/**
 * / route
 *
 * @class AuthRoute
 */
@Service()
export class AuthRoute extends BaseRoute {

    static signinPath: string = "/signin"
    static logoutPath: string = "/logout"

    static errorMap = {
        "not-authenticated": "You are not authenticated.",
        "no-privilege": "You do not have access.",
        "no-match": "Username and password do not match."
    }

    constructor(protected userRepo: UserRepository) {
        super()
    }

    public static create(router: Router, acl: WebAcl) {

        console.log("[IndexRoute::create] Creating auth route.")

        let authRoute: AuthRoute = Container.get(AuthRoute)

        router.get(this.signinPath, this.wrapAsync(acl.execute([])), (req: Request, res: Response, next: NextFunction) => {
            authRoute.get(req, res, next)
        })

        router.post(this.signinPath, this.wrapAsync(acl.execute([])), this.wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
            authRoute.post(req, res, next)
        }))

        router.get(this.logoutPath, this.wrapAsync(acl.execute([])), this.wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
            authRoute.logout(req, res, next)
        }))
    }

    /**
     * Shows signin page.
     * @param req 
     * @param res 
     * @param next 
     */
    public get(req: Request, res: Response, next: NextFunction) {

        if (req[WebAcl.sessionKey].user) {
            res.redirect(IndexRoute.indexPath)
        }

        const options = {}
        if (req.query["error"]) {
            options["error"] = AuthRoute.errorMap[req.query["error"]]
        }

        this.title = "Home | Project"
        this.render(req, res, "auth/signin", options)
    }

    public async post(req: Request, res: Response, next: NextFunction) {

        if (req[WebAcl.sessionKey].user) {
            res.redirect(IndexRoute.indexPath)
        }

        const user = await this.userRepo.getFirstByUsername(req.body.username)

        if (user) {
            let comparePromise = new Promise((resolve, reject) => {
                bcrypt.compare(req.body.password, user.password, (err, res) => {
                    if (err || !res) return reject(err)
                    delete user.password
                    req[WebAcl.sessionKey].user = user
                    const claims = {
                        iss: appConfig.appName,
                        aud: appConfig.appDomain
                    }
                    req[WebAcl.sessionKey].create(claims, (err, token) => {
                        resolve(token)
                    })
                })
            })
            return await comparePromise.then(result => {
                res.cookie(authConfig.sessionCookieName, result)
                return res.redirect(IndexRoute.indexPath)
            }).catch(error => {
                return res.redirect(AuthRoute.signinPath + "?error=no-match")
            })
        }
        return res.redirect(AuthRoute.signinPath + "?error=no-match")
    }

    public async logout(req: Request, res: Response, next: NextFunction) {
        if (req[WebAcl.sessionKey]) {
            req[WebAcl.sessionKey].destroy(() => { return })
        }
        res.clearCookie(authConfig.sessionCookieName)
        res.redirect(AuthRoute.signinPath)
    }
}