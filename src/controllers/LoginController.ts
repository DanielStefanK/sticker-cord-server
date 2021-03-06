import { Request, Response } from 'express'
import { Controller, Post, Middleware, Get } from '@overnightjs/core'
import { Logger } from '@overnightjs/logger'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'

import { User, getConnection } from '../db'
import * as ErrorHandler from './ErrorHandler'
import { loggedIn } from './middleware/auth'

@Controller('auth')
class LoginController {
  @Post('login')
  private login(req: Request, res: Response): void {
    const { username, password } = req.body

    if (!username) {
      res.json(ErrorHandler.logMissingValueError({}, 'username'))
      return
    }

    if (!password) {
      res.json(ErrorHandler.logMissingValueError({}, 'username'))
      return
    }

    Logger.Info(`logging in user ${username}`)

    const c = getConnection()
    const userRepo = c.getRepository(User)
    userRepo
      .findOne({ where: { username: username.toLowerCase() } })
      .then(async (u) => {
        if (!u) {
          Logger.Warn(`user ${username} was not found`)
          throw new Error('no user found')
        }

        const result = await bcrypt.compare(password, u.password)

        if (result) {
          const token = jwt.sign(
            { userId: u.id },
            process.env.JWT_SECRET || 'geheim',
            {
              expiresIn: process.env.JWT_EXPIRATION || '6h',
            },
          )

          res.json({
            success: true,
            token,
          })
        } else {
          Logger.Warn(`user ${username} tried to login with a wrong password`)
          throw new Error('wrong password')
        }
      })
      .catch(() => {
        Logger.Warn(`user ${username} could not be authenticated`)
        res.json(ErrorHandler.logAuthentication({}))
      })
  }

  @Post('changepassword')
  @Middleware([loggedIn])
  private async changePass(req: Request, res: Response): Promise<void> {
    const { oldPassword, newPassword } = req.body
    const result = await bcrypt.compare(oldPassword, req.user.password)

    if (result) {
      const c = getConnection()
      const userRepo = c.getRepository(User)
      userRepo
        .update(
          { id: req.user.id },
          { password: bcrypt.hashSync(newPassword, 10) },
        )
        .then((s) => {
          if (s) {
            res.json({
              success: true,
            })
          } else {
            Logger.Warn(`user was not found`)
            throw new Error('no user found')
          }
        })
        .catch(() => {
          Logger.Warn(`password could not be changed`)
          res.json(ErrorHandler.logProcessingError({}, 'change-password'))
        })
    }
  }

  @Get('me')
  @Middleware([loggedIn])
  private getMe(req: Request, res: Response): void {
    res.json({
      success: true,
      data: req.user,
    })
  }
}

export { LoginController }
