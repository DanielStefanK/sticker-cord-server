import { Request, Response } from 'express'
import { Controller, Middleware, Post } from '@overnightjs/core'
import { Logger } from '@overnightjs/logger'
import * as bcrypt from 'bcrypt'

import { User, getConnection } from '../db'
import * as ErrorHandler from './ErrorHandler'
import { loggedIn } from './middleware/auth'
import { isAdmin } from './middleware/admin'

@Controller('user')
class UserController {
  @Post('create')
  @Middleware([loggedIn, isAdmin])
  private async createUser(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body

    if (!username || !password) {
      res.json(ErrorHandler.logMissingValueError({}, 'username'))
      return
    }

    const userRepo = getConnection().getRepository(User)

    const user = userRepo.create({
      username: username,
      password: bcrypt.hashSync(password, 10),
    })

    userRepo
      .save(user)
      .then((u) => {
        if (u) {
          res.json({
            success: true,
            data: {
              username: u.username,
              id: u.id,
            },
          })
        } else {
          throw new Error('could not create user')
        }
      })
      .catch((e) => {
        Logger.Warn('could not create new user')
        Logger.Warn(e)
        res.json(ErrorHandler.logProcessingError({}, 'create user'))
      })
  }

  @Post('delete')
  @Middleware([loggedIn, isAdmin])
  private async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.body

    if (!id) {
      res.json(ErrorHandler.logMissingValueError({}, 'id'))
      return
    }

    if (id == req.user.id) {
      res.json(ErrorHandler.logAuthorization({}))
      return
    }

    const userRepo = getConnection().getRepository(User)

    const user = await userRepo.findOne({ where: { id } })

    if (user) {
      await userRepo.delete(user)
      res.json({
        success: true,
      })
    } else {
      res.json(ErrorHandler.logObjectDoesNotExist({}, id))
    }
  }

  @Post('load/all')
  @Middleware([loggedIn, isAdmin])
  private async loadAllUser(req: Request, res: Response): Promise<void> {
    const { page = 1 } = req.body
    const userRepo = getConnection().getRepository(User)

    const [users, count] = await userRepo.findAndCount({
      skip: (page - 1) * 20,
      take: 20,
    })
    res.json({
      success: true,
      data: {
        users,
        count,
        hasMore: page * 20 < count,
      },
    })
  }
}

export { UserController }
