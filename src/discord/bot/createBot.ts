import * as discord from 'discord.js'
import { botToken } from '../constants'

export function createBot(): discord.Client {
  const client = new discord.Client()

  client.login(botToken)

  return client
}
