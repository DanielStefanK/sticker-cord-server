import { Entity, ObjectID, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class DiscordUser {
  @PrimaryGeneratedColumn('uuid')
  id!: ObjectID

  @Column({ unique: true })
  discordUserId!: string

  @Column()
  accessToken!: string

  @Column()
  refreshToken!: string

  @Column()
  tokenExpiration!: Date

  @Column({
    nullable: true,
  })
  currentGuildId!: string
}
