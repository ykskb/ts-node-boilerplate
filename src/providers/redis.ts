import { Service } from "typedi";
import { RedisClient, createClient } from "redis";

@Service()
export class redisClientProvider {

    protected client: RedisClient

    constructor() {
        this.client = createClient({
            host: process.env.REDIS_HOST
        })
    }

    public provide(): RedisClient {
        return this.client
    }
}