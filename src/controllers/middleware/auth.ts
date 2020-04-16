import { Request, Response, NextFunction } from "express";
import * as jwt from 'jsonwebtoken'

import {User, getConnection} from '../../db'
import * as ErrorHandler from '../ErrorHandler'
import { Logger } from '@overnightjs/logger';


async function loggedIn (req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers?.authorization


  if (!authHeader) {
    Logger.Warn("request to secured route without token")
    res.json(ErrorHandler.logAuthentication({}))
    return;
  }

  const token = authHeader.split(' ')[1]

  try {
    jwt.verify(token, process.env.JWT_SECRET || "geheim")
    const decoded : any = jwt.decode(token, {json: true})
    if (decoded) {
      const userRepo = getConnection().getRepository(User)

      const user = await userRepo.findOne({where:{id: decoded.userId}})

      if (user) {
        req.user = {...user, password: undefined}
        next ()
        return;
      }

      throw new Error ("user not found")
    }

  } catch (e) {
    if (e?.name == jwt.TokenExpiredError) {
      Logger.Warn("request with expired token received")
      Logger.Warn(e)
      res.json(ErrorHandler.logAuthorization({}))
      return;
    } else if (e?.name == jwt.JsonWebTokenError) {
      Logger.Warn("request with invalid token received")
      Logger.Warn(e)
      res.json(ErrorHandler.logAuthorization({}))
      return;
    } else {
      Logger.Warn("received request with valid token but no user with id was found")
      Logger.Warn(e)
      res.json(ErrorHandler.logAuthorization({}))
      return;
    }

  }
}

export {
  loggedIn
}