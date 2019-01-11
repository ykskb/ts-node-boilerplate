import * as chai from "chai"
import "mocha"
import * as request from "supertest"
import * as http from "http"
import { getConnection } from "typeorm";
import { UserSeeder } from "../../../../database/seeds/UserSeeder";
import { runSeed } from "typeorm-seeding";
import { AuthRoute } from "../../../../routes/api/auth";
import { createServer } from "../../util/common"

var server: http.Server

describe('Auth API', () => {
    before(async () => {
        await createServer().then((s) => {
            server = s
        })
    })
    beforeEach(async () => {
        await getConnection('mysql').dropDatabase()
        await getConnection('mysql').runMigrations()
    })
    after(async () => {
        await getConnection('mysql').close()
        server.close()
    })
    it(': POST sign-in with correct credentials should return token.', async () => {
        await runSeed(UserSeeder)
        const authRes = await request(server).post(AuthRoute.authPath)
            .send({ username: "end.user", password: "fdsafdsa" })
        chai.assert.equal(authRes.status, 200)
        chai.assert.isTrue(authRes.body.token.length > 0)
    })
    it(': POST sign-in with incorrect credentials should return 401', async () => {
        const res = await request(server).post(AuthRoute.authPath)
            .send({ username: "wrong@user.com", password: "fdsafdsa" })
        chai.assert.equal(res.status, 401)
        chai.assert.equal(res.body.errors[0], "Username and password do not match.")
    })
})