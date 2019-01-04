import { NextFunction, Request, Response, Router } from "express"
import { BaseRoute } from './base'
import { ApiAcl } from "../../middleware/api_acl"
import { UserRepository } from "../../repositories/UserRepository"
import { Service, Container } from "typedi"
import { appConfig } from "../../config/app";

@Service()
export class UserRoute extends BaseRoute {

    static getUserPath: string = "/api/user"

    constructor(protected userRepo: UserRepository) {
        super()
    }

    public static create(router: Router, acl: ApiAcl) {

        console.log("[Api::UserRoute::create] Creating user route.")

        let userRoute: UserRoute = Container.get(UserRoute)

        router.get(
            this.getUserPath,
            this.wrapAsyncRequestHandler(acl.execute([appConfig.accessModules.endUser])),
            this.wrapAsyncRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
                await userRoute.getMyself(req, res, next)
            })
        )
    }

    public async getMyself(req: Request, res: Response, next: NextFunction) {
        res.send(req[ApiAcl.sessionKey].user)
    }
}