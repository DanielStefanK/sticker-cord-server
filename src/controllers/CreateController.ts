import { Request, Response } from 'express';
import { Controller, Middleware, Get, Put, Post, Delete } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import * as multer from 'multer'
import * as sharp from 'sharp'

import {Image, Sticker, Tag, getConnection} from '../db'
import * as ErrorHandler from './ErrorHandler'
import {loggedIn} from './middleware/auth'

var storage = multer.memoryStorage()

const upload = multer({ storage });

@Controller('sticker/create')
class CreateController {
  @Post('upload')
  @Middleware([loggedIn, upload.single('sticker')])
  private async uploadPicture(req: Request, res: Response) {
    const file = req.file
    Logger.Info("uploading file")

    if (!file.mimetype.startsWith("image")) {
      Logger.Warn("tried to upload non image file")
      res.send(ErrorHandler.logInvalidValueError({}, "mimetype"))
      return;
    }

    //TODO: use other lib that supports gifs
    Logger.Info("resizing file")
    const imgData = await sharp(file.buffer)
      .resize({width: 128, height: 128, fit: "inside"})
      .png()
      .toBuffer()

    const c = getConnection()
    const imgRepo = c.getRepository(Image)
    const img = imgRepo.create({data: imgData, mimetype: "image/png"})

    Logger.Info("saving file")
    await imgRepo.save(img)

    storage._removeFile(req, file, ()=>{
      Logger.Info("removed file from storage")
    })

    return res.send({
      success: true,
      imgId: img.id
    })
  }

  @Post('new')
  @Middleware([loggedIn])
  private async createSticker(req: Request, res: Response) {
    Logger.Info("creating new sticker")

    const {name, description, imageId, tags} = req.body

    if (!name) {
      Logger.Warn("no name for new sticker given")
      res.send(ErrorHandler.logMissingValueError({}, "name"))
      return;
    }

    if (!description) {
      Logger.Warn("no name for new sticker given")
      res.send(ErrorHandler.logMissingValueError({}, "description"))
      return;
    }

    const stickerRepo = getConnection().getRepository(Sticker)

    //TODO: check if image and tags exist

    const sticker = stickerRepo.create({
      image: {id: imageId},
      tags: tags.map ((id: number)=>({id})),
      creator: {id: req.user.id},
      stickerName: name,
      description
    })

    stickerRepo.save(sticker).then((s) => {
      Logger.Info("created new sticker")
      res.send({
        success: true,
        sticker: s
      })
    }).catch((e) => {
      Logger.Err("could not create sticker")
      Logger.Err(e)
      res.send(ErrorHandler.logProcessingError({}, "sticker-creation"))
    })

  }
}

export {CreateController}