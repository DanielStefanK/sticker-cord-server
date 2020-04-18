import { Request, Response } from 'express'
import { Controller, Get } from '@overnightjs/core'
import { Logger } from '@overnightjs/logger'

import { Sticker, getConnection } from '../db'
import * as ErrorHandler from './ErrorHandler'

@Controller('sticker')
class StickerController {
  @Get('load/all')
  private async getSticker(req: Request, res: Response): Promise<void> {
    Logger.Info(`requesting all tags`)
    const c = getConnection()
    const stickerRepo = c.getRepository(Sticker)

    stickerRepo
      .find({ relations: ['tags'] })
      .then((s) => {
        res.json({
          success: true,
          data: s,
        })
      })
      .catch((e) => {
        Logger.Err('could not load all sticker')
        Logger.Err(e)
        res.json(ErrorHandler.logProcessingError({}, 'load-sticker'))
      })
  }
}

export { StickerController }
