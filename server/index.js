import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { CLIENT_URL, PORT } from './config/index.js'
import { connectDatabase } from './config/database.js'
import { createHealthRoutes } from './routes/healthRoutes.js'
import { registerSocket } from './socket/registerSocket.js'

const app = express()
app.use(cors({ origin: CLIENT_URL }))
app.use(express.json())

await connectDatabase()

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
})

const cosmosService = registerSocket(io)
app.use(createHealthRoutes(cosmosService))

httpServer.listen(PORT, () => {
  console.log(`Cosmos server running on http://localhost:${PORT}`)
})
