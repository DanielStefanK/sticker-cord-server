import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import controllers from './controllers'
import { Server } from '@overnightjs/core'
import { Logger } from '@overnightjs/logger'
import { Response, Request } from 'express'

class StickerCord extends Server {
  private readonly SERVER_STARTED = 'Example server started on port: '

  constructor() {
    super(true)
    this.app.use(cors())
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.setupControllers()
  }

  private setupControllers(): void {
    const ctlrInstances = []
    for (const name in controllers) {
      if (controllers.hasOwnProperty(name)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const controller = (controllers as any)[name]
        ctlrInstances.push(new controller())
      }
    }
    super.addControllers(ctlrInstances)
  }

  public start(port: number): void {
    this.app.get('*', (_: Request, res: Response) => {
      res.status(404).send('This pages does not exist')
      Logger.Warn('tried to access page that does not exits')
    })

    this.app.listen(port, () => {
      Logger.Imp(this.SERVER_STARTED + port)
    })
  }
}

export default StickerCord
