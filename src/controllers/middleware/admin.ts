import { Request, Response, NextFunction } from 'express'

import * as ErrorHandler from '../ErrorHandler'

interface TokenData {
  userId?: string
}

async function isAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (req.user && req.user.isAdmin) {
    next()
    return
  }

  res.json(ErrorHandler.logAuthorization({}))
}

export { isAdmin }
