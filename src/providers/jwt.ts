import JwtRedisSessionHandler from "../middleware/jwt_session";
import { Service, Container } from "typedi";
import { redisClientProvider } from "./redis";
import { authConfig } from "../../dist/config/auth";

@Service()
export class JwtRedisSessionHandlerProvider {

    protected handler: JwtRedisSessionHandler

    constructor() {
        this.handler = new JwtRedisSessionHandler(
            {
                secret: authConfig.jwtSecret,
                keyspace: "sess:",
                maxAge: 60 * 60 * 24 * 3, // 3 days
                algorithm: "HS256",
                sessionKey: authConfig.sessionKey,
                headerArg: authConfig.headerArg,
                requestArg: authConfig.tokenArg
            }
        )
    }

    public provide(): JwtRedisSessionHandler {
        return this.handler
    }
}