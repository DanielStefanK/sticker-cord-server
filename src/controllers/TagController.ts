import { Request, Response } from 'express'
import { Controller, Get, Post, Middleware } from '@overnightjs/core'
import { Logger } from '@overnightjs/logger'

import { Tag, getConnection } from '../db'
import * as ErrorHandler from './ErrorHandler'
import { loggedIn } from './middleware/auth'

@Controller('tag')
class TagController {
  @Get('load/all')
  private async getTags(req: Request, res: Response): Promise<void> {
    Logger.Info(`requesting all tags`)
    const c = getConnection()
    const tagRepo = c.getRepository(Tag)

    tagRepo
      .find({
        order: {
          name: 'ASC',
          id: 'DESC',
        },
      })
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

  @Post('create')
  @Middleware([loggedIn])
  private async createTag(req: Request, res: Response): Promise<void> {
    Logger.Info('creating new tag')
    const { name, color, icon } = req.body
    //TODO: validation

    const tagRepo = getConnection().getRepository(Tag)

    const newTag = tagRepo.create({ name, color, icon })

    tagRepo
      .save(newTag)
      .then((t) => {
        res.json({
          success: true,
          data: t,
        })
      })
      .catch((e) => {
        Logger.Err('could not create new tag')
        Logger.Err(e)
        res.json(ErrorHandler.logProcessingError({}, 'create-tag'))
      })
  }
}

export { TagController }
