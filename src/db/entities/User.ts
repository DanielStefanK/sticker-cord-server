import {Entity, ObjectID, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: ObjectID;

    @Column()
    username!: string;

    @Column()
    password!: string
}