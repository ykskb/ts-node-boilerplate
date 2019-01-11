import { Server } from "../../../server";
import * as http from "http"
import { getConnection } from "typeorm";

export const createServer = async (): Promise<http.Server> => {
    const app = await Server.bootstrap().then((s) => {
        return s.app
    });
    app.set("port", 3001)
    const httpServer = http.createServer(app)
    return await httpServer.listen(3001)
}