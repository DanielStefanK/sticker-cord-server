import StickerCord from './server'
import { makeConnection } from './db'
import { Logger } from '@overnightjs/logger'

require('dotenv').config({
  path: '../.env',
})

makeConnection()
  .then(() => {
    const exampleServer = new StickerCord()
    exampleServer.start(6080)
  })
  .catch((e) => {
    Logger.Err('could not create Server')
    Logger.Err(e)
  })
