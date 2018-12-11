import { Factory, Seed } from 'typeorm-seeding'
import { Connection } from 'typeorm/connection/Connection'
import { User } from '../../entities/User'
import { UserRepository } from '../../repositories/UserRepository'
import { RoleRepository } from '../../repositories/RoleRepository'
import { RoleModuleRepository } from '../../repositories/RoleModuleRepository'
import { Role } from '../../entities/Role'
import { getConnection, createConnections } from 'typeorm'


export class UserSeeder implements Seed {

    protected userRepo: UserRepository
    protected roleRepo: RoleRepository
    protected roleModuleRepo: RoleModuleRepository

    constructor() {
        this.userRepo = new UserRepository()
        this.roleRepo = new RoleRepository()
        this.roleModuleRepo = new RoleModuleRepository()
    }

    public async seed(factory: Factory, connection: Connection): Promise<any> {
        let adminRole = new Role()
        adminRole.name = "Full Admin"

        const savedAdminRole = await this.roleRepo.createAndReturn(adminRole)
        await this.roleModuleRepo.createMany(savedAdminRole, ["admin-index"])

        await this.userRepo.create(
            {
                "email": "full@admin.com",
                "password": "fdsafdsa",
                "username": "full.admin",
                "phone_number": "12345678"
            },
            savedAdminRole
        )

        let endUserRole = new Role()
        endUserRole.name = "End User"

        const savedEndUserRole = await this.roleRepo.createAndReturn(endUserRole)
        await this.roleModuleRepo.createMany(savedEndUserRole, ["end-user"])

        await this.userRepo.create(
            {
                "email": "end@user.com",
                "password": "fdsafdsa",
                "username": "end.user",
                "phone_number": "23456789"
            },
            savedEndUserRole
        )

    }
}