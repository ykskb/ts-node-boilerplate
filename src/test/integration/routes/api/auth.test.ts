import * as chai from "chai"
import "mocha"
import * as request from "supertest"
import * as http from "http"
import { Server } from "../../../../server";
import { getConnectionManager } from "typeorm";
import { migrateDatabase } from "../../../utils/database";

var server

describe('Auth API Request', () => {
    before(async () => {
        const app = await Server.bootstrap().then((s) => {
            return s.app
        });
        app.set("port", 3001);
        const httpServer = http.createServer(app);
        server = await httpServer.listen(3001);
    })
    beforeEach(() => {
        migrateDatabase(getConnectionManager().get('mysql'))
    })
    it(': sign-in should return 200.', async () => {
        const res = await request(server).get('/signin')
        chai.assert.equal(res.status, 200)
    })
})