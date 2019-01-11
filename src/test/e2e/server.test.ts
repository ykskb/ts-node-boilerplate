import * as chai from "chai"
import "mocha"
import * as request from "supertest"
import * as http from "http"
import { getConnection } from "typeorm";
import { createServer } from "./util/common"

var server: http.Server

describe('Server', () => {
    before(async () => {
        await createServer().then((s) => {
            server = s
        })
    })
    beforeEach(async () => {
        await getConnection('mysql').dropDatabase().catch((reason: any) => { console.exception(reason) })
        await getConnection('mysql').runMigrations().catch((reason: any) => { console.exception(reason) })
    })
    after(async () => {
        await getConnection('mysql').close().catch((reason: any) => { console.exception(reason) })
        server.close()
    })
    it('Unknown web path should return error page with 404.', async () => {
        const res = await request(server).get('/unknown-path')
        chai.assert.equal(res.status, 404)
    })
})