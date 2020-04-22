import { Request, Response } from 'express'
import { Controller, Post, Get, Middleware } from '@overnightjs/core'
import { Logger } from '@overnightjs/logger'
import * as jwt from 'jsonwebtoken'

import { DiscordUser, getConnection } from '../db'
import * as ErrorHandler from './ErrorHandler'
import {
  getAccessToken,
  getUserIdentity,
  getGuildInfo,
} from '../discord/oauth/utils'
import { loggedInDiscord } from './middleware/discordAuth'

@Controller('discord/auth')
class DiscordLoginController {
  @Post('login')
  private async login(req: Request, res: Response): Promise<void> {
    const { code, guildId } = req.body

    getAccessToken(code)
      .then(async (r) => {
        const duInfo = await getUserIdentity(r.access_token)
        const duRepo = getConnection().getRepository(DiscordUser)

        const existingUser = await duRepo.findOne({
          where: { discordUserId: duInfo.id },
        })

        if (existingUser) {
          const token = jwt.sign(
            {
              discordUserId: duInfo.id,
              accessToken: r.access_token,
              refreshToken: r.refresh_token,
            },
            process.env.JWT_SECRET || 'geheim',
            {
              expiresIn: `${r.expires_in}s`,
            },
          )

          res.json({
            success: true,
            token,
            user: duInfo,
          })
          return
        } else {
          const du = duRepo.create({
            discordUserId: duInfo.id,
            currentGuildId: guildId,
          })

          await duRepo.save(du)
        }
        const token = jwt.sign(
          {
            discordUserId: duInfo.id,
            accessToken: r.access_token,
            refreshToken: r.refresh_token,
          },
          process.env.JWT_SECRET || 'geheim',
          {
            expiresIn: `${r.expires_in}s`,
          },
        )

        const guildInfo = await getGuildInfo(guildId)

        res.json({
          success: true,
          token,
          user: { ...duInfo, guild: guildInfo },
          guildInfo,
        })
        return
      })
      .catch((e) => {
        Logger.Warn('could not create discord user account')
        Logger.Warn(e)
        res.json(ErrorHandler.logAuthorization({}))
      })
  }

  @Get('me')
  @Middleware(loggedInDiscord)
  private async getUserInfo(req: Request, res: Response): Promise<void> {
    const info = await getUserIdentity(req.discordUser.accessToken)
    const guildInfo = await getGuildInfo(req.discordUser.currentGuildId)
    res.json({
      success: true,
      user: { ...info, guild: guildInfo },
    })
  }
}

export { DiscordLoginController }
