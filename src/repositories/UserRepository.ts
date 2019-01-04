import { getConnectionManager, getManager, Repository, createConnections } from "typeorm"
import { User } from "../entities/sql/User"
import * as bcrypt from "bcryptjs"
import { Role } from "../entities/sql/Role"
import { Service } from "typedi"

@Service()
export class UserRepository {

    protected repo: Repository<User>

    constructor() {
        this.repo = getConnectionManager().get('mysql').getRepository(User)
    }

    public async create(data: Object, role: Role) {
        let hashPromise = new Promise((resolve, reject) => {
            bcrypt.hash(data["password"], 10, async (err, hash) => {
                let user = new User
                user.email = data["email"]
                user.username = data["username"]
                user.password = hash
                user.phone_number = data["phone_number"]
                user.role = role
                resolve(await this.repo.save(user))
            })
        })
        await hashPromise.then(result => { return result }).catch(error => { throw error })
    }

    public async getFirstByUsername(username: string, load: Array<string> = []) {
        return this.repo.createQueryBuilder("user")
            .where("username = :usernameVal", { usernameVal: username })
            .innerJoinAndSelect("user.role", "role")
            .leftJoinAndSelect("role.role_modules", "modules")
            .getOne()
    }
}