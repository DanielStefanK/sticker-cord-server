import { Request, Response } from 'express'
import { Controller, Middleware, Post } from '@overnightjs/core'
import { Logger } from '@overnightjs/logger'
import * as multer from 'multer'
import * as gm from 'gm'

import { Image, Sticker, getConnection } from '../db'
import * as ErrorHandler from './ErrorHandler'
import { loggedIn } from './middleware/auth'

const storage = multer.memoryStorage()

const upload = multer({ storage })

@Controller('sticker/create')
class CreateController {
  @Post('upload')
  @Middleware([loggedIn, upload.single('sticker')])
  private async uploadPicture(req: Request, res: Response): Promise<void> {
    const file = req.file
    Logger.Info('uploading file')

    if (!file.mimetype.startsWith('image')) {
      Logger.Warn('tried to upload non image file')
      res.send(ErrorHandler.logInvalidValueError({}, 'mimetype'))
      return
    }

    //TODO: use other lib that supports gifs
    Logger.Info('resizing file')

    let formatter = gm(file.buffer)

    if (file.size > 256000) {
      formatter = formatter.resize(128, 128)
    }

    formatter.stream(function (err, stdout, stderr) {
      if (err) {
        Logger.Err('error wile formatting img')
        Logger.Err(err)
        return
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chunks: any = []
      stdout.on('data', function (chunk) {
        chunks.push(chunk)
      })
      stdout.on('end', async function () {
        const image = Buffer.concat(chunks)
        const c = getConnection()
        const imgRepo = c.getRepository(Image)
        const img = imgRepo.create({ data: image, mimetype: file.mimetype })

        Logger.Info('saving file')
        await imgRepo.save(img)

        storage._removeFile(req, file, () => {
          Logger.Info('removed file from storage')
        })

        res.send({
          success: true,
          imgId: img.id,
        })
      })
      stderr.on('data', function (data) {
        Logger.Err('error wile formatting img')
        Logger.Err(data)
      })
    })
  }

  @Post('new')
  @Middleware([loggedIn])
  private async createSticker(req: Request, res: Response): Promise<void> {
    Logger.Info('creating new sticker')

    const { name, description, imageId, tags } = req.body
    //TODO: better validation

    if (!name) {
      Logger.Warn('no name for new sticker given')
      res.send(ErrorHandler.logMissingValueError({}, 'name'))
      return
    }

    if (!description) {
      Logger.Warn('no name for new sticker given')
      res.send(ErrorHandler.logMissingValueError({}, 'description'))
      return
    }

    const stickerRepo = getConnection().getRepository(Sticker)

    //TODO: check if image and tags exist

    const sticker = stickerRepo.create({
      image: { id: imageId },
      tags: tags.map((id: number) => ({ id })),
      creator: { id: req.user.id },
      stickerName: name,
      description,
    })

    stickerRepo
      .save(sticker)
      .then((s) => {
        Logger.Info('created new sticker')
        res.send({
          success: true,
          sticker: s,
        })
      })
      .catch((e) => {
        Logger.Err('could not create sticker')
        Logger.Err(e)
        res.send(ErrorHandler.logProcessingError({}, 'sticker-creation'))
      })
  }

  @Post('update')
  @Middleware([loggedIn])
  private async updateSticker(req: Request, res: Response): Promise<void> {
    Logger.Info('updateting a sticker')

    const { name, description, imageId, tags, id, downloads } = req.body
    //TODO: better validation

    if (!name) {
      Logger.Warn('no name for new sticker given')
      res.send(ErrorHandler.logMissingValueError({}, 'name'))
      return
    }

    if (!description) {
      Logger.Warn('no name for new sticker given')
      res.send(ErrorHandler.logMissingValueError({}, 'description'))
      return
    }

    const stickerRepo = getConnection().getRepository(Sticker)
    const imgRepo = getConnection().getRepository(Image)

    //TODO: check if image and tags exist

    const sticker = await stickerRepo.findOne({ where: { id } })

    if (sticker) {
      const img = await imgRepo.findOne({ where: { id: imageId } })

      if (!img) {
        Logger.Warn('sticker not found for update')
        res.send(ErrorHandler.logObjectDoesNotExist({}, id))
        return
      }

      sticker.image = img
      sticker.description = description
      sticker.stickerName = name
      sticker.tags = tags.map((id: number) => ({ id }))
      if (downloads) {
        sticker.downloads = downloads
      }
      stickerRepo.save(sticker).then((s) => {
        res.json({
          success: true,
          data: s,
        })
      })
    } else {
      Logger.Warn('sticker not found for update')
      res.send(ErrorHandler.logObjectDoesNotExist({}, id))
      return
    }
  }

  @Post('delete')
  @Middleware([loggedIn])
  private async deleteSticker(req: Request, res: Response): Promise<void> {
    Logger.Info('delting a sticker')

    const { id } = req.body

    const stickerRepo = getConnection().getRepository(Sticker)
    const sticker = await stickerRepo.findOne({ where: { id } })

    if (sticker) {
      await stickerRepo.delete({ id })
      res.json({
        success: true,
      })
    } else {
      Logger.Warn('sticker not found for deletion')
      res.send(ErrorHandler.logObjectDoesNotExist({}, id))
      return
    }
  }
}

export { CreateController }
