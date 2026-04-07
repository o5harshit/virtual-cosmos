import { PROXIMITY_RADIUS, WORLD } from '../config/index.js'
import * as cosmos from '../services/cosmosService.js'
import { removeSession, saveSession } from '../services/sessionService.js'

export function registerCosmosController(io) {
  function sendAllUsers() {
    io.emit('users:update', cosmos.getAllUsers())
  }

  function sendConnections(user) {
    io.to(user.id).emit('connections:update', cosmos.getConnectedUsers(user))
  }

  function handleProximityEvents(events) {
    for (const event of events) {
      if (event.type === 'connected') {
        io.sockets.sockets.get(event.first.id)?.join(event.roomId)
        io.sockets.sockets.get(event.second.id)?.join(event.roomId)

        io.to(event.first.id).emit('proximity:connected', {
          roomId: event.roomId,
          user: cosmos.publicUser(event.second),
        })
        io.to(event.second.id).emit('proximity:connected', {
          roomId: event.roomId,
          user: cosmos.publicUser(event.first),
        })
      }

      if (event.type === 'disconnected') {
        io.sockets.sockets.get(event.first.id)?.leave(event.roomId)
        io.sockets.sockets.get(event.second.id)?.leave(event.roomId)

        io.to(event.first.id).emit('proximity:disconnected', {
          roomId: event.roomId,
          userId: event.second.id,
        })
        io.to(event.second.id).emit('proximity:disconnected', {
          roomId: event.roomId,
          userId: event.first.id,
        })
      }

      sendConnections(event.first)
      sendConnections(event.second)
    }
  }

  io.on('connection', (socket) => {
    socket.on('join-cosmos', async ({ name }) => {
      const user = cosmos.addUser(socket.id, name)

      socket.emit('me', { id: socket.id, radius: PROXIMITY_RADIUS, world: WORLD })
      handleProximityEvents(cosmos.checkProximity(user))
      sendAllUsers()
      await saveSession(user)
    })

    socket.on('player:move', async (position) => {
      const user = cosmos.moveUser(socket.id, position)
      if (!user) return

      handleProximityEvents(cosmos.checkProximity(user))
      sendAllUsers()
      await saveSession(user)
    })

    socket.on('chat:send', ({ roomId, text }) => {
      const user = cosmos.getUser(socket.id)
      const message = text?.trim()
      if (!user || !message || !roomId) return
      if (!cosmos.canUseRoom(user.id, roomId)) return

      io.to(roomId).emit('chat:message', {
        roomId,
        userId: user.id,
        name: user.name,
        text: message.slice(0, 300),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    })

    socket.on('disconnect', async () => {
      handleProximityEvents(cosmos.removeUser(socket.id))
      sendAllUsers()
      await removeSession(socket.id)
    })
  })

  return cosmos
}
