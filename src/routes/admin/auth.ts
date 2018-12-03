import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";
import validator from "validator"

/**
 * / route
 *
 * @class AuthRoute
 */
export class AuthRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("[IndexRoute::create] Creating auth route.");

        let authRoute: AuthRoute = new AuthRoute;

        router.get("/signin", (req: Request, res: Response, next: NextFunction) => {
            authRoute.getSignin(req, res, next);
        });

        router.post("/signin", (req: Request, res: Response, next: NextFunction) => {
            authRoute.postSignin(req, res, next);
        });
    }

    constructor() {
        super();
    }

    /**
     * Shows signin page.
     * @param req 
     * @param res 
     * @param next 
     */
    public getSignin(req: Request, res: Response, next: NextFunction) {
        this.title = "Home | Project";
        this.render(req, res, "auth/signin");
    }

    public postSignin(req: Request, res: Response, next: NextFunction) {
        let options: Object = {
            "username": req.body.email,
            "password": req.body.password
        };
        this.render(req, res, "auth/signin", options);
    }
}