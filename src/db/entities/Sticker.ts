import {
  Entity,
  ObjectID,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  RelationId,
} from 'typeorm'

import { User } from './User'
import { Tag } from './Tag'
import { Image } from './Image'

@Entity()
export class Sticker {
  @PrimaryGeneratedColumn('uuid')
  id!: ObjectID

  @Column()
  stickerName!: string

  @Column()
  description?: string

  @ManyToOne(() => User)
  @JoinColumn()
  creator!: User

  @OneToOne(() => Image)
  @JoinColumn()
  image!: Image

  @ManyToMany(() => Tag)
  @JoinTable()
  tags!: Tag[]

  @RelationId('image')
  imageId!: string

  @Column({ default: 0 })
  downloads!: number
}
