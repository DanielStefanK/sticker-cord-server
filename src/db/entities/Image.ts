import {Entity, ObjectID, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Image {
    @PrimaryGeneratedColumn("uuid")
    id!: ObjectID;

    @Column()
    mimetype!: string;

    @Column("bytea", {nullable: false})
    data!: Buffer;
}