import {
  Entity,
  ObjectID,
  Column,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'

@Entity()
@Unique(['name'])
class Tag {
  @PrimaryGeneratedColumn()
  id!: ObjectID

  @Column()
  name!: string

  @Column({ nullable: true })
  color?: string

  @Column({ nullable: true })
  icon?: string

  @Column({ default: false })
  adult?: boolean
}

const initalTags = ['funny', 'meme', 'gif']

export { Tag, initalTags }
