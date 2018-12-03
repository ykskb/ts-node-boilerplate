import { getConnectionManager, getManager, Repository, createConnections } from "typeorm";
import { User } from "../entities/User";
import * as bcrypt from "bcryptjs"
import { Role } from "../entities/Role";

export class UserRepository {

    protected repo: Repository<User>;

    constructor() {
        this.repo = getConnectionManager().get('mysql').getRepository(User);
    }

    public async create(data: Object, role: Role) {
        bcrypt.hash(data["password"], 10, (err, hash) => {
            let user = new User;
            user.email = data["email"];
            user.username = data["username"];
            user.password = hash;
            user.phone_number = data["phone_number"];
            user.role = role;
            this.repo.save(user);
        });
    }

    public async getFirstByUsername(username: string, load: Array<string> = []) {
        return this.repo.createQueryBuilder()
            .where("username = :usernameVal", { usernameVal: username })
            .innerJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('role.role_modules', 'modules')
            .getOne();
    }
}