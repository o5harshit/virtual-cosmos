import { AVATAR_COLORS, PROXIMITY_RADIUS, WORLD } from '../config/index.js'

const users = new Map()
const activeRooms = new Map()

function randomPosition() {
  return {
    x: Math.floor(80 + Math.random() * (WORLD.width - 160)),
    y: Math.floor(80 + Math.random() * (WORLD.height - 160)),
  }
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min
  return Math.max(min, Math.min(max, value))
}

function distance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

function pairKey(firstId, secondId) {
  return [firstId, secondId].sort().join(':')
}

function roomName(firstId, secondId) {
  return `room:${pairKey(firstId, secondId)}`
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    color: user.color,
    x: user.x,
    y: user.y,
    connections: Array.from(user.connections),
  }
}

function makeConnection(first, second) {
  const key = pairKey(first.id, second.id)
  if (activeRooms.has(key)) return null

  const roomId = roomName(first.id, second.id)
  activeRooms.set(key, roomId)
  first.connections.add(second.id)
  second.connections.add(first.id)

  return { type: 'connected', roomId, first, second }
}

function breakConnection(first, second) {
  const key = pairKey(first.id, second.id)
  const roomId = activeRooms.get(key)
  if (!roomId) return null

  activeRooms.delete(key)
  first.connections.delete(second.id)
  second.connections.delete(first.id)

  return { type: 'disconnected', roomId, first, second }
}

export function addUser(socketId, name) {
  const position = randomPosition()
  const cleanName = name?.trim()

  const user = {
    id: socketId,
    name: cleanName || `Guest ${socketId.slice(0, 4)}`,
    color: AVATAR_COLORS[users.size % AVATAR_COLORS.length],
    x: position.x,
    y: position.y,
    connections: new Set(),
  }

  users.set(socketId, user)
  return user
}

export function moveUser(socketId, position) {
  const user = users.get(socketId)
  if (!user) return null

  user.x = clamp(Number(position.x), 20, WORLD.width - 20)
  user.y = clamp(Number(position.y), 20, WORLD.height - 20)

  return user
}

export function removeUser(socketId) {
  const user = users.get(socketId)
  if (!user) return []

  const events = []

  for (const otherId of user.connections) {
    const otherUser = users.get(otherId)
    if (otherUser) events.push(breakConnection(user, otherUser))
  }

  users.delete(socketId)
  return events.filter(Boolean)
}

export function checkProximity(movedUser) {
  const events = []

  for (const otherUser of users.values()) {
    if (otherUser.id === movedUser.id) continue

    const event = distance(movedUser, otherUser) < PROXIMITY_RADIUS
      ? makeConnection(movedUser, otherUser)
      : breakConnection(movedUser, otherUser)

    if (event) events.push(event)
  }

  return events
}

export function getConnectedUsers(user) {
  return Array.from(user.connections)
    .map((id) => users.get(id))
    .filter(Boolean)
    .map(publicUser)
}

export function canUseRoom(userId, roomId) {
  const user = users.get(userId)
  if (!user) return false

  return Array.from(user.connections).some((otherId) => roomName(user.id, otherId) === roomId)
}

export function getUser(id) {
  return users.get(id)
}

export function getAllUsers() {
  return Array.from(users.values()).map(publicUser)
}

export function getUserCount() {
  return users.size
}

export function getRoomCount() {
  return activeRooms.size
}

export { publicUser }
