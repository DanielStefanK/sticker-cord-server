import { Request, Response, NextFunction } from 'express'
import { Logger } from '@overnightjs/logger'

import * as ErrorHandler from '../ErrorHandler'

async function loggedIn(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (req.user) {
    next()
  } else {
    Logger.Warn(
      `tried to access resticted route without user. ip: ${
        req.headers.forwarded || req.ip
      }`,
    )
    res.json(ErrorHandler.logAuthorization({}))
  }
}

export { loggedIn }
