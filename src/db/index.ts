import { createConnection, Connection } from "typeorm";
import * as bcrypt from 'bcrypt'

import {Image} from './entities/Image'
import {User} from './entities/User'


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
      User
    ],
    database: "sticker-cord"
  })

  const userRepo = connection.getRepository(User)

  const user = await userRepo.findOne()

  if (!user) {
    const user = userRepo.create({
      username: process.env.INITAL_USER || "daniel",
      password: bcrypt.hashSync(process.env.INITAL_PASS || "geheim", 10)
    })

    await userRepo.save(user)
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
  User
}