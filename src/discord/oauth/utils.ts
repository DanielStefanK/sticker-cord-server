import {
  clientId,
  clientSecret,
  redirectUri,
  scope,
  botToken,
} from '../constants'

import fetch from 'node-fetch'
import { Logger } from '@overnightjs/logger'

interface AccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

interface DiscordUserInfo {
  id: string
  username: string
  discriminator: string
  avatar: string
  verified: boolean
  email: string
  flags: number
  premium_type: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Empty {}

interface Emoji extends Empty {
  id: string
  name: string | null
}

interface GuildInfoResponse extends Empty {
  id: string
  name: string
  icon: string | undefined
  emojis: Array<Emoji>
}

export function getAccessToken(code: string): Promise<AccessTokenResponse> {
  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('client_secret', clientSecret)
  params.append('grant_type', 'authorization_code')
  params.append('code', code)
  params.append('redirect_uri', redirectUri)
  params.append('scope', scope)

  return fetch('https://discordapp.com/api/oauth2/token', {
    method: 'POST',
    body: params,
  }).then((r) => {
    if (r.ok) {
      return r.json()
    }
    r.text().then((t) => {
      Logger.Warn(t, true)
    })
    throw new Error(r.statusText)
  })
}

export function getUserIdentity(accessToken: string): Promise<DiscordUserInfo> {
  return fetch('https://discordapp.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'GET',
  }).then((res) => {
    return res.json()
  })
}

export function getGuildInfo(guildId: string): Promise<GuildInfoResponse> {
  return fetch(`https://discordapp.com/api/guilds/${guildId}`, {
    headers: {
      Authorization: `Bot ${botToken}`,
    },
    method: 'GET',
  }).then((res) => {
    return res.json()
  })
}
