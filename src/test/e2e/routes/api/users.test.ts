import * as chai from "chai"
import "mocha"
import * as request from "supertest"
import * as http from "http"
import { getConnection } from "typeorm";
import { UserSeeder } from "../../../../database/seeds/UserSeeder";
import { runSeed } from "typeorm-seeding";
import { AuthRoute } from "../../../../routes/api/auth";
import { createServer } from "../../util/common"
import { UserRoute } from "../../../../routes/api/users";


var server: http.Server

describe('User API', () => {
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
    it(': Get myself without authentication should return 401 not authenticated.', async () => {
        const getMyselfRes = await request(server).get(UserRoute.getUserPath)
        chai.assert.equal(getMyselfRes.status, 401)
    })
    it(': Get myself after authenticate should return info with 200.', async () => {
        await runSeed(UserSeeder)
        const authRes = await request(server).post(AuthRoute.authPath)
            .send({ username: "end.user", password: "fdsafdsa" })
        chai.assert.equal(authRes.status, 200)
        const getMyselfRes = await request(server).get(UserRoute.getUserPath)
            .set('Authorization', `token ${authRes.body.token}`)
        chai.assert.equal(getMyselfRes.status, 200)
        chai.assert.equal(getMyselfRes.body.username, "end.user")
    })
    it(': Get myself after authenticate with wrong role should return 403 no permission.', async () => {
        await runSeed(UserSeeder)
        const authRes = await request(server).post(AuthRoute.authPath)
            .send({ username: "full.admin", password: "fdsafdsa" })
        chai.assert.equal(authRes.status, 200)
        const getMyselfRes = await request(server).get(UserRoute.getUserPath)
            .set('Authorization', `token ${authRes.body.token}`)
        chai.assert.equal(getMyselfRes.status, 403)
    })
})