import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from "typeorm";
import {Role} from './Role';

@Entity()
export class RoleModule {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Role, role => role.role_modules)
    role: Role;

    @Column('varchar', {length: 127})
    module: string;
}