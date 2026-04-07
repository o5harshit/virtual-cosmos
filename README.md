# Virtual Cosmos

A small 2D realtime room where players move around and chat only when they are close to each other.

## Tech Stack

- React with Vite
- PixiJS for the 2D canvas
- Tailwind CSS setup with Vite
- Node.js, Express and Socket.IO
- MongoDB with Mongoose 


## Run Locally

Open two terminals.

Terminal 1:

```bash
cd server
npm install
npm run dev
```

Terminal 2:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in two browser tabs. Enter different names, move with `WASD` or arrow keys, and bring the two avatars close together.

## Environment Variables

Create `server/.env` if you want custom settings:

```bash
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/virtual-cosmos
```

Create `client/.env` only if the backend URL changes:

```bash
VITE_SERVER_URL=http://localhost:5000
```

## Features

- Realtime player movement
- Multiple users visible on the same PixiJS map
- Proximity detection with a fixed radius
- Automatic chat connect when users are nearby
- Automatic chat disconnect when users move apart
- Active connections list
- Simple chat panel

## Backend Structure

```text
server/
  index.js                         App entry point
  config/index.js                  Port, client URL, world size, radius and avatar colors
  config/database.js               MongoDB connection helper
  models/Session.js                Mongoose session model
  controllers/homeController.js
  controllers/healthController.js
  controllers/cosmosController.js
                                    HTTP and Socket.IO controllers
  routes/homeRoutes.js             Home route
  routes/healthRoutes.js           Health route
  services/cosmosService.js        User state, movement and proximity logic
  services/sessionService.js       MongoDB session save/delete helpers
  socket/registerSocket.js         Socket controller registration
```

This backend is API based, so the "view" in MVC is the JSON response or Socket.IO event sent back to the frontend. There are no server-rendered template files.

Main socket events:

- `join-cosmos` creates the user in the room
- `player:move` updates position and checks nearby users
- `proximity:connected` opens nearby chat
- `proximity:disconnected` closes nearby chat
- `chat:send` sends a message only if the user is still in the room
