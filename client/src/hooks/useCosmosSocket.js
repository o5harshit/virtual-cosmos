import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

export function useCosmosSocket() {
  const socketRef = useRef(null)
  const [me, setMe] = useState(null)
  const [world, setWorld] = useState({ width: 1200, height: 700 })
  const [users, setUsers] = useState([])
  const [connections, setConnections] = useState([])
  const [messages, setMessages] = useState([])

  const activeRoom = useMemo(() => {
    if (!me?.id || connections.length === 0) return null
    return `room:${[me.id, connections[0].id].sort().join(':')}`
  }, [me, connections])

  useEffect(() => {
    const socket = io(SERVER_URL, { autoConnect: false })
    socketRef.current = socket

    socket.on('me', (payload) => {
      setMe({ id: payload.id, radius: payload.radius })
      setWorld(payload.world)
    })

    socket.on('users:update', setUsers)
    socket.on('connections:update', setConnections)

    socket.on('proximity:connected', ({ user }) => {
      setMessages((oldMessages) => [
        ...oldMessages,
        { system: true, text: `Connected with ${user.name}. You can chat now.` },
      ])
    })

    socket.on('proximity:disconnected', () => {
      setMessages((oldMessages) => [
        ...oldMessages,
        { system: true, text: 'You moved away. Chat closed.' },
      ])
    })

    socket.on('chat:message', (message) => {
      setMessages((oldMessages) => [...oldMessages, message])
    })

    socket.on('connect_error', () => {
      setMessages((oldMessages) => [
        ...oldMessages,
        { system: true, text: 'Backend not connected. Start the server and refresh.' },
      ])
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [])

  const join = useCallback((name) => {
    const socket = socketRef.current
    if (!socket) return

    if (!socket.connected) socket.connect()
    socket.emit('join-cosmos', { name })
  }, [])

  const movePlayer = useCallback((position) => {
    const socket = socketRef.current
    if (!socket?.connected) return
    socket.emit('player:move', position)
  }, [])

  const sendMessage = useCallback((text) => {
    const message = text.trim()
    if (!activeRoom || !message) return

    socketRef.current?.emit('chat:send', {
      roomId: activeRoom,
      text: message,
    })
  }, [activeRoom])

  return {
    me,
    world,
    users,
    connections,
    messages,
    join,
    movePlayer,
    sendMessage,
  }
}
