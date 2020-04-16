import { createConnection, Connection } from "typeorm";
import {Image} from './entities/Image'

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
      Image
    ],
    database: "sticker-cord"
  })

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
  Image
}