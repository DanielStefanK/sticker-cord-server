import { Request, Response } from 'express'
import { Controller, Get } from '@overnightjs/core'
import { Logger } from '@overnightjs/logger'

import { Tag, getConnection } from '../db'
import * as ErrorHandler from './ErrorHandler'

@Controller('tag')
class TagController {
  @Get('load/all')
  private async getPictureById(req: Request, res: Response): Promise<void> {
    Logger.Info(`requesting all tags`)
    const c = getConnection()
    const tagRepo = c.getRepository(Tag)

    tagRepo
      .find()
      .then((t) => {
        res.json({
          success: true,
          data: t,
        })
      })
      .catch((e) => {
        Logger.Err('could not load all tags')
        Logger.Err(e)
        res.json(ErrorHandler.logProcessingError({}, 'load-tags'))
      })
  }
}

export { TagController }
