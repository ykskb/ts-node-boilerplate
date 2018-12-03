import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");

import "reflect-metadata";

import { ApiAcl } from "./middleware/api_acl";
// import {WebAcl} from "./middleware/web_acl";

import { IndexRoute } from "./routes/admin/index";
import { AuthRoute as WebAuthRoute } from "./routes/admin/auth";
import { AuthRoute as ApiAuthRoute } from "./routes/api/auth";
import { UserRoute } from "./routes/api/users";
import { createConnections } from "typeorm";
import { UserSeeder } from "./database/seeds/UserSeeder";

/**
 * The server.
 *
 * @class Server
 */
export class Server {

    public app: express.Application;

    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */
    public static bootstrap(): Server {
        return new Server();
    }

    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    constructor() {
        this.app = express();
        createConnections().then(async connection => {
            this.config();
            this.routes();
            this.api();
            this.error();
        })
    }

    /**
     * Configure application
     *
     * @class Server
     * @method config
     */
    public config() {
        //add static paths
        this.app.use(express.static(path.join(__dirname, "public")));

        //configure pug
        this.app.set("views", path.join(__dirname, "views"));
        this.app.set("view engine", "pug");

        //use logger middlware
        this.app.use(logger("dev"));

        //use json form parser middlware
        this.app.use(bodyParser.json());

        //use query string parser middlware
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));

        //use cookie parser middleware
        this.app.use(cookieParser("SECRET_GOES_HERE"));

        //use override middlware
        this.app.use(methodOverride());
    }

    /**
     * Create router
     *
     * @class Server
     * @method api
     */
    public routes() {

        let router: express.Router;
        router = express.Router();

        IndexRoute.create(router);
        WebAuthRoute.create(router);

        // let webAcl: WebAcl = new WebAcl;
        let apiAcl: ApiAcl = new ApiAcl();
        ApiAuthRoute.create(router, apiAcl);
        UserRoute.create(router, apiAcl);

        this.app.use(router);
    }

    /**
     * Create REST API routes
     *
     * @class Server
     * @method api
     */
    public api() {
        //empty for now
    }

    public error() {
        // catch 404 and forward to error handler
        this.app.use(function async (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
            console.log('coming to error.');
            if (res.headersSent) {
                console.log('header sent.');
                return next(err);
            }
            res.status(500);
            res.json(JSON.stringify(err));
            throw err;
        });

        // error handling
        this.app.use(errorHandler());
    }
}