import { Request, Response } from 'express'
import { Controller, Post, Middleware } from '@overnightjs/core'
import { Logger } from '@overnightjs/logger'
import * as discord from 'discord.js'

import { getConnection, Sticker } from '../db'
import * as ErrorHandler from './ErrorHandler'

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
    Logger.Info('Adding sticker to server')
    const { stickerId, name } = req.body
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
      Logger.Warn('current guild of user does not exist')
      res.json(ErrorHandler.logObjectDoesNotExist({}, currentGuildId))
      return
    }

    const eM = new discord.GuildEmojiManager(guild)

    const timeout = new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id)
        reject('Timed out')
      }, 5000)
    })

    Promise.race([
      eM.create(
        sticker.image.data,
        name ? name.replace(/ /g, '') : sticker.stickerName.replace(/ /g, ''),
      ),
      timeout,
    ])
      .then(() => {
        res.json({
          success: true,
        })

        stickerRepo
          .createQueryBuilder('sticker')
          .andWhere('sticker.id = :id', { id: stickerId })
          .getOne()
          .then((s) => {
            if (s) {
              s.downloads = s.downloads + 1
              stickerRepo.save(s)
            }
          })
          .catch(() => {
            Logger.Info('could not increase download count')
          })
      })
      .catch((e) => {
        Logger.Err('could not add emoji')
        Logger.Err(e)
        res.json(ErrorHandler.logProcessingError({}, 'add emoji'))
      })
  }
}

export { DiscordStickerController }
