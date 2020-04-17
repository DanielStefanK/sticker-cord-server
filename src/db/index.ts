import { createConnection, Connection } from "typeorm";
import * as bcrypt from 'bcrypt'

import {Image} from './entities/Image'
import {User} from './entities/User'
import {Sticker} from './entities/Sticker'
import {Tag, initalTags} from './entities/Tag'
import { Logger } from '@overnightjs/logger';


let connection: Connection

async function makeConnection (): Promise<Connection> {
  connection = await createConnection({
    type: "postgres",
    host: process.env.DB_HOST|| "localhost",
    port: Number.parseInt (process.env.DB_PORT || "5432"),
    username: process.env.DB_USER||"postgres",
    password: process.env.DB_PASS||"postgres",
    synchronize: true,
    logging: false,
    entities: [
      Image,
      User,
      Tag,
      Sticker
    ],
    database: "sticker-cord"
  })

  const userRepo = connection.getRepository(User)
  const user = await userRepo.findOne()

  // create inital user
  if (!user) {
    const user = userRepo.create({
      username: process.env.INITAL_USER || "daniel",
      password: bcrypt.hashSync(process.env.INITAL_PASS || "geheim", 10)
    })

    await userRepo.save(user)
  }

  const tagRepo = connection.getRepository(Tag)
  const tag = await tagRepo.findOne()

  if (!tag) {
    await Promise.all (
      initalTags.map((t) =>
        tagRepo.save (tagRepo.create({name: t}))
      )
    )
  }

  return connection
}

function getConnection (): Connection {
  if (connection)
    return connection
  throw new Error("Connection not established")
}

export {
  makeConnection,
  getConnection,
  Image,
  User,
  Tag,
  Sticker
}