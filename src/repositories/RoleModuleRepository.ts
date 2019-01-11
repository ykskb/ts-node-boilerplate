import { getConnection } from "typeorm";
import { Role } from "../entities/sql/Role";
import { RoleModule } from "../entities/sql/RoleModule";
import { Service } from "typedi";

@Service()
export class RoleModuleRepository {

    public async createMany(role: Role, modules: Array<string>) {
        for (var i = 0; i < modules.length; i++) {
            let roleModule: RoleModule = new RoleModule();
            roleModule.role = role;
            roleModule.module = modules[i];
            await getConnection('mysql').getRepository(RoleModule).save(roleModule);
        }
    }
}