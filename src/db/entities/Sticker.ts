import {Entity, ObjectID, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

import {User} from './User'
import {Tag} from './Tag'
import {Image} from './Image'

@Entity()
export class Sticker {
    @PrimaryGeneratedColumn("uuid")
    id!: ObjectID;

    @Column()
    stickerName!: string;

    @Column()
    description!: string;

    @ManyToOne(type => User)
    @JoinColumn()
    creator!: User;

    @OneToOne(type => Image)
    @JoinColumn()
    image!: Image;

    @ManyToMany(type => Tag)
    @JoinTable()
    tags!: Tag[];
}