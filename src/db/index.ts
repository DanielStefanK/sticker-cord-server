import { createConnection, Connection } from "typeorm";

let connection: Connection

async function makeConnection (): Promise<Connection> {
  connection = await createConnection({
    type: "mongodb",
    host: process.env.DB_HOST|| "localhost",
    port: Number.parseInt (process.env.DB_PORT || "27017"),
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
  getConnection
}