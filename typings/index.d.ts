declare namespace Express {
  export interface Request {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    discordUser?: any
  }
}
