import { Factory, Seed } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { User } from '../../entities/User';
import { UserRepository } from '../../repositories/UserRepository';
import { RoleRepository } from '../../repositories/RoleRepository';
import { RoleModuleRepository } from '../../repositories/RoleModuleRepository';
import { Role } from '../../entities/Role';
import { getConnection, createConnections } from 'typeorm';


export class UserSeeder implements Seed {

    protected userRepo: UserRepository;
    protected roleRepo: RoleRepository;
    protected roleModuleRepo: RoleModuleRepository;

    constructor() {
        this.userRepo = new UserRepository();
        this.roleRepo = new RoleRepository();
        this.roleModuleRepo = new RoleModuleRepository();
    }

    public async seed(factory: Factory, connection: Connection): Promise<any> {
        let role = new Role();
        role.name = "Full Admin";

        let modules = ["end-user"];

        const savedRole = await this.roleRepo.createAndReturn(role);
        await this.roleModuleRepo.createMany(savedRole, modules);

        await this.userRepo.create(
            {
                "email": "full@admin.com",
                "password": "fdsafdsa",
                "username": "full.admin",
                "phone_number": "12345678"
            },
            savedRole
        )
    }
}