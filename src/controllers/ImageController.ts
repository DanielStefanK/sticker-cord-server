import { Request, Response } from 'express'
import { Controller, Get } from '@overnightjs/core'
import { Logger } from '@overnightjs/logger'

import { Image, getConnection } from '../db'
import * as ErrorHandler from './ErrorHandler'

@Controller('img')
class ImageController {
  @Get(':id')
  private async getPictureById(req: Request, res: Response): Promise<void> {
    const id = req.params.id
    Logger.Info(`requesting image with id ${id}`)
    const c = getConnection()
    const imgRepo = c.getRepository(Image)
    imgRepo
      .findOne(id)
      .then((img) => {
        res.writeHead(200, {
          'Content-Type': img?.mimetype,
          'Content-Length': img?.data.byteLength,
        })

        res.end(img?.data)
      })
      .catch(() => {
        Logger.Warn(`image with id ${id} was not found`)
        res.send(ErrorHandler.logObjectDoesNotExist({}, id))
      })
  }
}

export { ImageController }
