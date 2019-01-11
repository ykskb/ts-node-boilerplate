import * as chai from "chai"
import "mocha"
import * as request from "supertest"
import * as http from "http"
import { getConnection } from "typeorm";
import { UserSeeder } from "../../../../database/seeds/UserSeeder";
import { AuthRoute } from "../../../../routes/admin/auth";
import { runSeed } from "typeorm-seeding";
import { authConfig } from "../../../../config/auth";
import { IndexRoute } from "../../../../routes/admin";
import { createServer } from "../../util/common"

var server: http.Server

describe('Web Login Page', () => {
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
    it(': GET sign-in should return 200.', async () => {
        const res = await request(server).get(AuthRoute.signinPath)
        chai.assert.equal(res.status, 200)
    })
    it(': POST sign-in with incorrect credentials should return 302 to signin with error msg.', async () => {
        const res = await request(server).post(AuthRoute.signinPath)
            .send({ username: "wrong@user.com", password: "fdsafdsa" })
        chai.assert.equal(res.status, 302)
        chai.assert.equal(res.header.location, '/signin?error=no-match')
    })
    it(': POST sign-in with correct credentials should return 302 to index page with cookie and 200 from index page with cookie.', async () => {
        await runSeed(UserSeeder).catch((reason: any) => { console.exception(reason) })
        const authRes = await request(server).post(AuthRoute.signinPath)
            .send({ username: "full.admin", password: "fdsafdsa" })

        chai.assert.equal(authRes.status, 302)
        chai.assert.equal(authRes.header.location, '/')
        let cookieNameExists = false
        let cookieIndex = 0
        for (let i = 0; i < authRes.header['set-cookie'].length; i++) {
            if (authRes.header['set-cookie'][i].indexOf(authConfig.sessionCookieName) > -1) {
                cookieIndex = i
                cookieNameExists = true
            }
        }
        chai.assert.isTrue(cookieNameExists)

        const indexRes = await request(server).get(IndexRoute.indexPath)
            .set('Cookie', authRes.header['set-cookie'][cookieIndex])
        chai.assert.equal(indexRes.status, 200)
    })
})