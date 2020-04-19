import { Request, Response } from 'express'
import { Controller, Get } from '@overnightjs/core'
import { Logger } from '@overnightjs/logger'

import * as mime from 'mime-types'

import { Image, Sticker, getConnection } from '../db'
import * as ErrorHandler from './ErrorHandler'

@Controller('img')
class ImageController {
  @Get(':id')
  private async getPictureById(req: Request, res: Response): Promise<void> {
    const id = req.params.id
    const filename = req.query.filename
    Logger.Info(`requesting image with id ${id}`)
    const c = getConnection()
    const imgRepo = c.getRepository(Image)
    imgRepo
      .findOne(id)
      .then((img) => {
        const fileExtension = mime.extension(img?.mimetype || '')

        res.writeHead(200, {
          'Content-Type': img?.mimetype,
          'Content-Length': img?.data.byteLength,
          ...(filename
            ? {
                'Content-disposition': `attachment; filename=${filename}.${fileExtension};`,
              }
            : {}),
        })

        res.end(img?.data)
        if (filename) {
          const stickerRepo = c.getRepository(Sticker)
          stickerRepo
            .findOne({ where: { image: { id } } })
            .then((s) => {
              if (s) {
                s.downloads = s.downloads + 1
                stickerRepo.save(s)
              }
            })
            .catch(() => {
              Logger.Err('could not increment download count')
            })
        }
      })
      .catch(() => {
        Logger.Warn(`image with id ${id} was not found`)
        res.send(ErrorHandler.logObjectDoesNotExist({}, id))
      })
  }
}

export { ImageController }
