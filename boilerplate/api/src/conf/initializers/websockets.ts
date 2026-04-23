import AppEnv from '@conf/AppEnv.js'
import allowedCorsOrigins from '@conf/system/allowedCorsOrigins.js'
import resolveWebsocketUser from '@conf/system/resolveWebsocketUser.js'
import { PsychicApp } from '@rvoh/psychic'
import { allowRequestForOrigins, PsychicAppWebsockets, Ws } from '@rvoh/psychic-websockets'
import { Redis } from 'ioredis'

export default (psy: PsychicApp) => {
  if (AppEnv.serviceRole !== 'websockets' && !AppEnv.isTest) return

  psy.plugin(async () => {
    await PsychicAppWebsockets.init(psy, initializeWebsockets)
  })
}

function initializeWebsockets(wsApp: PsychicAppWebsockets) {
  wsApp.set(
    'connection',
    AppEnv.isProduction
      ? new Redis({
          host: AppEnv.string('WS_REDIS_HOST'),
          port: AppEnv.integer('WS_REDIS_PORT', { optional: true }) || 6379,
          username: AppEnv.string('WS_REDIS_USERNAME'),
          password: AppEnv.string('WS_REDIS_PASSWORD'),
          tls: {},
          maxRetriesPerRequest: null,
        })
      : new Redis({
          host: AppEnv.string('WS_REDIS_HOST', { optional: true }) || 'localhost',
          port: AppEnv.integer('WS_REDIS_PORT', { optional: true }) || 6379,
          username: AppEnv.string('WS_REDIS_USERNAME', { optional: true }),
          password: AppEnv.string('WS_REDIS_PASSWORD', { optional: true }),
          // tls:  {},
          maxRetriesPerRequest: null,
        }),
  )

  wsApp.set('socketio', {
    // socketio server options here
    cors: {
      credentials: true,
      origin: allowedCorsOrigins(),
    },
    // socket.io's `cors.origin` above only constrains HTTP long-polling —
    // native WebSocket upgrades bypass CORS. `allowRequestForOrigins` wraps
    // socket.io's `allowRequest` hook to enforce the same allowlist across
    // every transport. Supply a function here to layer in your own logic
    // (e.g. auth-token inspection) in addition to the origin check.
    allowRequest: allowRequestForOrigins(allowedCorsOrigins()),
  })

  // ******
  // HOOKS:
  // ******

  wsApp.on('ws:start', io => {
    io.of('/').on('connection', async socket => {
      const user = await resolveWebsocketUser(socket)
      if (!user) {
        socket.disconnect(true)
        return
      }
      // this automatically fires the /ops/connection-success message
      await Ws.register(socket, user)
    })
  })

  wsApp.on('ws:connect', () => {
    // do something upon websocket connection being established
  })
}
