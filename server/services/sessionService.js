import mongoose from 'mongoose'
import { Session } from '../models/Session.js'

export async function saveSession(user) {
  if (!process.env.MONGO_URI || mongoose.connection.readyState !== 1) return

  await Session.findOneAndUpdate(
    { socketId: user.id },
    {
      socketId: user.id,
      name: user.name,
      color: user.color,
      position: { x: user.x, y: user.y },
      activeConnections: Array.from(user.connections),
    },
    { upsert: true },
  )
}

export async function removeSession(socketId) {
  if (!process.env.MONGO_URI || mongoose.connection.readyState !== 1) return
  await Session.deleteOne({ socketId })
}
