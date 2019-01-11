import { getConnection } from "typeorm";
import { Role } from "../entities/sql/Role";
import { Service } from "typedi";

@Service()
export class RoleRepository {

    public async createAndReturn(role: Role): Promise<Role> {
        return await getConnection('mysql').getRepository(Role).save(role);
    }
}