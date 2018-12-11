import { NextFunction, Request, Response, Router } from "express"
import { UserRepository } from "../../repositories/UserRepository"
import { ApiAcl } from "../../middleware/api_acl"
import * as bcrypt from "bcryptjs"
import { BaseRoute } from "./base"
import { Service, Container } from "typedi"
import { appConfig } from "../../config/app";

@Service()
export class AuthRoute extends BaseRoute {

    static authPath: string = "/api/authenticate"

    constructor(protected userRepo: UserRepository) {
        super()
    }

    public static create(router: Router, acl: ApiAcl) {

        console.log("[Api::AuthRoute::create] Creating auth route.")

        let authRoute: AuthRoute = Container.get(AuthRoute)

        router.post(this.authPath, this.wrapAsync(acl.execute([])), this.wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
            await authRoute.post(req, res, next)
        }))
    }

    public async post(req: Request, res: Response, next: NextFunction) {

        const user = await this.userRepo.getFirstByUsername(req.body.username)

        if (user) {
            let comparePromise = new Promise((resolve, reject) => {
                bcrypt.compare(req.body.password, user.password, (err, res) => {
                    if (err || !res) return reject(err)
                    delete user.password
                    req[ApiAcl.sessionKey].user = user
                    const claims = {
                        iss: appConfig.appName,
                        aud: appConfig.appDomain
                    }
                    req[ApiAcl.sessionKey].create(claims, (err, token) => {
                        resolve(token)
                    })
                })
            })
            return await comparePromise.then(result => {
                return res.json({ token: result }).end()
            }).catch(error => {
                return res.status(401).json({ 'errors': ['Username and password do not match.'] }).end()
            })
        }
        return res.status(401).json({ 'errors': ['Username and password do not match.'] }).end()
    }
}