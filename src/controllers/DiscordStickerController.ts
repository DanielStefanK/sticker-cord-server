import { Request, Response } from 'express'
import { Controller, Post, Get, Middleware } from '@overnightjs/core'
import { Logger } from '@overnightjs/logger'
import * as jwt from 'jsonwebtoken'
import * as discord from 'discord.js'

import { DiscordUser, getConnection, Sticker } from '../db'
import * as ErrorHandler from './ErrorHandler'
import {
  getAccessToken,
  getUserIdentity,
  getGuildInfo,
} from '../discord/oauth/utils'
import { loggedInDiscord } from './middleware/discordAuth'
import { createBot } from '../discord/bot/createBot'

@Controller('discord/sticker')
class DiscordStickerController {
  bot: discord.Client

  constructor() {
    this.bot = createBot()
  }

  @Post('add')
  @Middleware([loggedInDiscord])
  private async addStickerToCurrentGuild(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { stickerId } = req.body
    const { currentGuildId } = req.discordUser

    const stickerRepo = getConnection().getRepository(Sticker)

    const sticker = await stickerRepo
      .createQueryBuilder('sticker')
      .andWhere('sticker.id = :id', { id: stickerId })
      .innerJoinAndSelect('sticker.image', 'image')
      .getOne()

    if (!sticker) {
      res.json(ErrorHandler.logObjectDoesNotExist({}, stickerId))
      return
    }

    const guild = this.bot.guilds.resolve(currentGuildId)

    if (!guild) {
      res.json(ErrorHandler.logObjectDoesNotExist({}, currentGuildId))
      return
    }

    const eM = new discord.GuildEmojiManager(guild)

    await eM.create(sticker.image.data, sticker.stickerName.replace(/ /g, ''))

    res.json({
      success: true,
    })
  }
}

export { DiscordStickerController }
