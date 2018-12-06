import { getConnectionManager, getManager, Repository, createConnections } from "typeorm";
import { User } from "../entities/User";
import * as bcrypt from "bcryptjs"
import { Role } from "../entities/Role";
import { RoleModule } from "../entities/RoleModule";

export class RoleModuleRepository {

    protected repo: Repository<RoleModule>;

    constructor() {
        this.repo = getConnectionManager().get('mysql').getRepository(RoleModule);
    }

    public async createMany(role: Role, modules: Array<string>) {
        console.log(modules);
        for (var i = 0; i < modules.length; i++) {
            let roleModule: RoleModule = new RoleModule();
            roleModule.role = role;
            roleModule.module = modules[i];
            await this.repo.save(roleModule);
        }
    }
}