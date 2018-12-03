import { NextFunction, Request, Response, Router } from "express";
import { UserRepository } from "../../repositories/UserRepository";
import { ApiAcl } from "../../middleware/api_acl";
import * as bcrypt from "bcryptjs"
import { BaseRoute } from "./base";

export class AuthRoute extends BaseRoute {

    protected userRepo: UserRepository;

    constructor() {
        super();
        this.userRepo = new UserRepository();
    }

    public static create(router: Router, acl: ApiAcl) {

        console.log("[Api::AuthRoute::create] Creating auth route.");

        let authRoute: AuthRoute = new AuthRoute;

        router.post("/api/authenticate", this.wrapAsync(acl.execute([])), this.wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
            await authRoute.post(req, res, next);
        }));
    }

    public async post(req: Request, res: Response, next: NextFunction) {

        const user = await this.userRepo.getFirstByUsername(req.body.username);

        if (user) {
            let comparePromise = new Promise((resolve, reject) => {
                bcrypt.compare(req.body.password, user.password, (err, res) => {
                    if (err || !res) reject(err);
                    req["jwtSession"].user = user;
                    const claims = {
                        iss: process.env.APP_NAME,
                        aud: process.env.APP_DOMAIN
                    };
                    req["jwtSession"].create(claims, (err, token) => {
                        resolve(token);
                    });
                });
            });
            return await comparePromise.then(result => { return res.json({ token: result }).end(); })
                .catch(error => { return res.status(401).json({ 'errors': ['Username and password do not matcha.'] }).end(); });
        }
        return res.status(401).json({ 'errors': ['Username and password do not match.'] }).end()
    }
}