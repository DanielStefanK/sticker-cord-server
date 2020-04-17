import { Entity, ObjectID, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
class Tag {
  @PrimaryGeneratedColumn()
  id!: ObjectID

  @Column()
  name!: string
}

const initalTags = ['funny', 'meme', 'gif']

export { Tag, initalTags }
