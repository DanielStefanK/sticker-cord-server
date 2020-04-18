import { Request, Response } from 'express'
import { Controller, Get, Post } from '@overnightjs/core'
import { Logger } from '@overnightjs/logger'

import { Sticker, getConnection } from '../db'
import * as ErrorHandler from './ErrorHandler'

@Controller('sticker')
class StickerController {
  @Post('load/all')
  private async getSticker(req: Request, res: Response): Promise<void> {
    Logger.Info(`requesting all tags`)
    const { term, tags } = req.body
    const c = getConnection()
    const stickerRepo = c.getRepository(Sticker)

    try {
      Logger.Info(tags)

      const q = stickerRepo
        .createQueryBuilder('sticker')
        .leftJoinAndSelect('sticker.tags', 'tags')

      if (tags && tags.length) {
        q.where('tags.id in (:...tags)', {
          tags: tags,
        })
      }

      if (term) {
        q.andWhere('sticker.stickerName like :term', {
          term: `${term}%`,
        })
      }

      q.getMany()
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
    } catch (e) {
      Logger.Err(e)
    }
  }
}

export { StickerController }
