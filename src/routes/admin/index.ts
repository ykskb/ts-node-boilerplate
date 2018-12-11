import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./base";
import { WebAcl } from "../../middleware/web_acl";
import { AuthRoute } from "./auth";


/**
 * / route
 *
 * @class IndexRoute
 */
export class IndexRoute extends BaseRoute {

    static indexPath: string = "/"

    /**
     * Create the routes.
     *
     * @class IndexRoute
     * @method create
     * @static
     */
    public static create(router: Router, acl: WebAcl) {

        console.log("[IndexRoute::create] Creating index route.");

        let indexRoute: IndexRoute = new IndexRoute;

        router.get(IndexRoute.indexPath, this.wrapAsync(acl.execute(['end-user'])), this.wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
            indexRoute.index(req, res, next);
        }));
    }

    /**
     * Constructor
     *
     * @class IndexRoute
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * The home page route.
     *
     * @class IndexRoute
     * @method index
     * @param req {Request} The express Request object.
     * @param res {Response} The express Response object.
     * @next {NextFunction} Execute the next method.
     */
    public async index(req: Request, res: Response, next: NextFunction) {
        //set custom title
        this.title = "Home | Project";

        //set options
        let options: Object = {
            "message": "fdsa",
            "user": req[WebAcl.sessionKey].user,
            "logout_path": AuthRoute.logoutPath
        };

        //render template
        this.render(req, res, "index", options);
    }
}