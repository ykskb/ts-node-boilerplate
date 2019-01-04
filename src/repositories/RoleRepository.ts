import { getConnectionManager, getManager, Repository, createConnections } from "typeorm";
import { Role } from "../entities/sql/Role";
import { Service } from "typedi";

@Service()
export class RoleRepository {

    protected repo: Repository<Role>;

    constructor() {
        this.repo = getConnectionManager().get('mysql').getRepository(Role);
    }

    public async createAndReturn(role: Role): Promise<Role> {
        return await this.repo.save(role);
    }
}