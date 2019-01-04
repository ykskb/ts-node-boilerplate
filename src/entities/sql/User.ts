import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn} from "typeorm";
import { Role } from "./Role";

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

    @OneToOne(type => Role)
    @JoinColumn()
    role: Role;
}