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

describe('Admin Index Page', () => {
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
    it(': GET index without login should return 302 to signin with error msg.', async () => {
        const res = await request(server).get(IndexRoute.indexPath)
        chai.assert.equal(res.status, 302)
        chai.assert.equal(res.header.location, '/signin?error=not-authenticated')
    })
    it(': GET index with cookie missing required role should return 302 with no permission.', async () => {
        await runSeed(UserSeeder).catch((reason: any) => { console.exception(reason) })
        const authRes = await request(server).post(AuthRoute.signinPath)
            .send({ username: "end.user", password: "fdsafdsa" })

        chai.assert.equal(authRes.status, 302)
        chai.assert.equal(authRes.header.location, "/")

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
        chai.assert.equal(indexRes.status, 302)
        chai.assert.equal(indexRes.header.location, AuthRoute.signinPath + "?error=no-privilege")
    })
    it(': GET index with correct cookie should return 200.', async () => {
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