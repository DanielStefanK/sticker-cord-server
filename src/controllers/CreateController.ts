import { Request, Response } from 'express';
import { Controller, Middleware, Get, Put, Post, Delete } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import * as multer from 'multer'
import * as sharp from 'sharp'

import {Image, getConnection} from '../db'
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


    return res.send({
      success: true,
      imgId: img.id
    })
  }
}

export {CreateController}