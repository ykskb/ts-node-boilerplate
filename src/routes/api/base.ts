import { NextFunction, Request, Response, Router } from "express";
import { RequestHandlerParams } from "express-serve-static-core";

export class BaseRoute {
    static wrapAsync(func) {
        return (req, res, next) => {
            func(req, res, next)
                .then(() => next)
                .catch(err => next(err))
        }
    }
}