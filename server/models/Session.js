import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema(
  {
    socketId: String,
    name: String,
    color: String,
    position: {
      x: Number,
      y: Number,
    },
    activeConnections: [String],
  },
  { timestamps: true },
)

export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema)
