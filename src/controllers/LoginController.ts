import { Request, Response } from 'express';
import { Controller, Middleware, Get, Put, Post, Delete } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'

import {User, getConnection} from '../db'
import * as ErrorHandler from './ErrorHandler'

@Controller('auth')
class LoginController {
    @Post('login')
    private login(req: Request, res: Response) {
      const {username, password} = req.body

      if (!username) {
        res.json(ErrorHandler.logMissingValueError({}, "username"))
        return;
      }

      if (!password) {
        res.json(ErrorHandler.logMissingValueError({},"username"))
        return;
      }

      Logger.Info(`logging in user ${username}`)

      const c = getConnection()
      const userRepo = c.getRepository(User)
      userRepo.findOne({where:{username}}).then (async (u) => {
        if (!u) {
          Logger.Warn(`user ${username} was not found`)
          throw new Error("no user found")
        }

        const result = await bcrypt.compare (password, u.password)

        if (result) {
          const token = jwt.sign(
            { userId: u.id },
            process.env.JWT_SECRET || "geheim",
            {expiresIn: process.env.JWT_EXPIRATION || "6h"}
          );

          res.json({
            success: true,
            token
          })
        } else {
          Logger.Warn(`user ${username} tried to login with a wrong password`)
          throw new Error ("wrong password")
        }
      }).catch(() => {
        Logger.Warn(`user ${username} could not be authenticated`)
        res.json(ErrorHandler.logAuthentication({}))
      })
    }
}

export {LoginController}