import { Request, Response, NextFunction } from 'express'
import { Logger } from '@overnightjs/logger'
import * as jwt from 'jsonwebtoken'

import { User, getConnection, DiscordUser } from '../../db'

interface TokenData {
  userId?: string
  discordUserId?: boolean
}

async function provideUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers?.authorization

  if (!authHeader) {
    next()
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'geheim')
    const decoded: TokenData | null = jwt.decode(token, { json: true })
    if (decoded) {
      if (decoded.userId) {
        const userRepo = getConnection().getRepository(User)

        const user = await userRepo.findOne({ where: { id: decoded.userId } })

        if (user) {
          req.user = { ...user }
          next()
          return
        }

        throw new Error('user not found')
      } else if (decoded.discordUserId) {
        const duRepo = getConnection().getRepository(DiscordUser)

        const user = await duRepo.findOne({
          where: { discordUserId: decoded.discordUserId },
        })

        if (user) {
          req.discordUser = { ...user }
          next()
          return
        }

        throw new Error('user not found')
      }
    }
  } catch (e) {
    if (e?.name == jwt.TokenExpiredError) {
      Logger.Warn('request with expired token received')
      Logger.Warn(e)
      next()
      return
    } else if (e?.name == jwt.JsonWebTokenError) {
      Logger.Warn('request with invalid token received')
      Logger.Warn(e)
      next()
      return
    } else {
      Logger.Warn(
        'received request with valid token but no user with id was found',
      )
      Logger.Warn(e, true)
      next()
      return
    }
  }
}

export { provideUser }
