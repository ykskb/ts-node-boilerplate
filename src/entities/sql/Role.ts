import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import {RoleModule} from './RoleModule';

@Entity()
export class Role {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', {length: 127})
    name: string;

    @OneToMany(type => RoleModule, role_module => role_module.role)
    role_modules: RoleModule[]
}