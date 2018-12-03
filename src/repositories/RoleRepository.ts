import { getConnectionManager, getManager, Repository, createConnections } from "typeorm";
import { User } from "../entities/User";
import * as bcrypt from "bcryptjs"
import { Role } from "../entities/Role";

export class RoleRepository {

    protected repo: Repository<Role>;

    constructor() {
        this.repo = getConnectionManager().get('mysql').getRepository(Role);
    }

    public async createAndReturn(role: Role): Promise<Role> {
        return await this.repo.save(role);
    }
}