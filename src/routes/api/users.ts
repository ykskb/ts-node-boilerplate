import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from './base';
import { ApiAcl } from "../../middleware/api_acl";
import { UserRepository } from "../../repositories/UserRepository";


export class UserRoute extends BaseRoute {

    public static create(router: Router, acl: ApiAcl) {
        console.log("[Api::UserRoute::create] Creating user route.");

        let userRoute: UserRoute = new UserRoute;
        let modules = ['end-user'];

        let repo = new UserRepository();

        router.get("/api/user", this.wrapAsync(acl.execute(modules)),this.wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
            await userRoute.getMyself(req, res, next);
        }));
    }

    public async getMyself(req: Request, res: Response, next: NextFunction) {
        res.send(req[ApiAcl.requestKey]);
    }
}