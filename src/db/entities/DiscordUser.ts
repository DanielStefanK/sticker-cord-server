import { Entity, ObjectID, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class DiscordUser {
  @PrimaryGeneratedColumn('uuid')
  id!: ObjectID

  @Column({ unique: true })
  discordUserId!: string

  @Column({
    nullable: true,
  })
  currentGuildId!: string
}
