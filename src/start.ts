import StickerCord from './server';
import {makeConnection} from './db'
import { Connection } from 'typeorm';
import { Logger } from '@overnightjs/logger';

require('dotenv').config({
  path: "../.env"
})

makeConnection().then((c: Connection) => {
  const exampleServer = new StickerCord();
  exampleServer.start(6080);
}).catch ((e) => {
  Logger.Err("could not create Server")
  Logger.Err(e)
})


