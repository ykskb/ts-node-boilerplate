import { getConnectionManager, getManager, Repository, createConnections } from "typeorm";
import { Role } from "../entities/Role";
import { RoleModule } from "../entities/RoleModule";
import {Service} from "typedi";

@Service()
export class RoleModuleRepository {

    protected repo: Repository<RoleModule>;

    constructor() {
        this.repo = getConnectionManager().get('mysql').getRepository(RoleModule);
    }

    public async createMany(role: Role, modules: Array<string>) {
        for (var i = 0; i < modules.length; i++) {
            let roleModule: RoleModule = new RoleModule();
            roleModule.role = role;
            roleModule.module = modules[i];
            await this.repo.save(roleModule);
        }
    }
}