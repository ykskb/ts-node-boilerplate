import { Factory, Seed } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { User } from '../../entities/User';
import { UserRepository } from '../../repositories/UserRepository';
import { RoleRepository } from '../../repositories/RoleRepository';
import { RoleModuleRepository } from '../../repositories/RoleModuleRepository';
import { Role } from '../../entities/Role';


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
        //await factory(User)().seedMany(10);

        let role = new Role();
        role.name = "Full Admin";

        let modules = ["end-user"];

        const savedRole = await this.roleRepo.createAndReturn(role);
        this.roleModuleRepo.createMany(savedRole, modules);
        
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