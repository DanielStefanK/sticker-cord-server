import { Entity, ObjectID, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
class Tag {
  @PrimaryGeneratedColumn()
  id!: ObjectID

  @Column()
  name!: string

  @Column({ nullable: true })
  color?: string

  @Column({ nullable: true })
  icon?: string
}

const initalTags = ['funny', 'meme', 'gif']

export { Tag, initalTags }
