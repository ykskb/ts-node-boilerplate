import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', {length: 127})
    username: string;

    @Column('varchar', {length: 255})
    email: string;

    @Column('varchar', {length: 255})
    password: string;

    @Column('varchar', {length: 127})
    phone_number: string;

    @Column('int', {unsigned: true})
    role_id: number;
}