import { Entity, ObjectID, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: ObjectID

  @Column({ unique: true })
  username!: string

  @Column()
  password!: string

  @Column({ default: false })
  isAdmin!: boolean
}
