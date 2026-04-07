import { useEffect, useMemo, useRef, useState } from 'react'
import { Application, Container } from 'pixi.js'
import { createPlayerSprite, drawGrid, safeDestroyPixiApp } from '../utils/pixiScene.js'

const SPEED = 4
const MOVEMENT_KEYS = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'])

function isTypingInField() {
  const activeElement = document.activeElement
  if (!activeElement) return false

  const tagName = activeElement.tagName.toLowerCase()
  return tagName === 'input' || tagName === 'textarea' || activeElement.isContentEditable
}

export function CosmosCanvas({ me, world, users, connections, onMove, movementLocked }) {
  const hostRef = useRef(null)
  const appRef = useRef(null)
  const playerLayerRef = useRef(null)
  const keysRef = useRef(new Set())
  const lastPositionRef = useRef(null)
  const movementLockedRef = useRef(movementLocked)
  const [canvasReady, setCanvasReady] = useState(false)

  const meUser = useMemo(() => users.find((user) => user.id === me?.id), [users, me])

  useEffect(() => {
    movementLockedRef.current = movementLocked

    if (movementLocked) {
      keysRef.current.clear()
    }
  }, [movementLocked])

  useEffect(() => {
    function press(event) {
      const key = event.key.toLowerCase()

      if (movementLockedRef.current || isTypingInField()) {
        keysRef.current.clear()
        return
      }

      if (MOVEMENT_KEYS.has(key)) {
        event.preventDefault()
        keysRef.current.add(key)
      }
    }

    function release(event) {
      keysRef.current.delete(event.key.toLowerCase())
    }

    window.addEventListener('keydown', press)
    window.addEventListener('keyup', release)

    return () => {
      window.removeEventListener('keydown', press)
      window.removeEventListener('keyup', release)
    }
  }, [])

  useEffect(() => {
    if (!meUser) return
    lastPositionRef.current = { x: meUser.x, y: meUser.y }
  }, [meUser])

  useEffect(() => {
    if (!hostRef.current) return

    let cancelled = false
    let initialized = false
    let destroyed = false
    let resizeObserver
    const app = new Application()

    function destroyOnce() {
      if (destroyed || !initialized) return
      destroyed = true
      safeDestroyPixiApp(app)
    }

    async function setupCanvas() {
      await app.init({
        width: world.width,
        height: world.height,
        backgroundColor: 0x111827,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      })
      initialized = true

      if (cancelled) {
        destroyOnce()
        return
      }

      appRef.current = app
      hostRef.current.innerHTML = ''
      hostRef.current.appendChild(app.canvas)

      const playerLayer = new Container()
      playerLayerRef.current = playerLayer

      app.stage.addChild(drawGrid(world))
      app.stage.addChild(playerLayer)

      function resizeCanvas() {
        if (!hostRef.current) return

        const hostWidth = Math.max(320, hostRef.current.clientWidth)
        const hostHeight = Math.max(320, hostRef.current.clientHeight)
        const scale = Math.min(hostWidth / world.width, hostHeight / world.height)

        app.renderer.resize(Math.floor(world.width * scale), Math.floor(world.height * scale))
        app.stage.scale.set(scale)
      }

      resizeCanvas()
      resizeObserver = new ResizeObserver(resizeCanvas)
      resizeObserver.observe(hostRef.current)

      setCanvasReady(true)

      app.ticker.add(() => {
        const current = lastPositionRef.current
        if (!current) return
        if (movementLockedRef.current || isTypingInField()) return

        let nextX = current.x
        let nextY = current.y
        const pressed = keysRef.current

        if (pressed.has('w') || pressed.has('arrowup')) nextY -= SPEED
        if (pressed.has('s') || pressed.has('arrowdown')) nextY += SPEED
        if (pressed.has('a') || pressed.has('arrowleft')) nextX -= SPEED
        if (pressed.has('d') || pressed.has('arrowright')) nextX += SPEED

        nextX = Math.max(20, Math.min(world.width - 20, nextX))
        nextY = Math.max(20, Math.min(world.height - 20, nextY))

        if (nextX !== current.x || nextY !== current.y) {
          lastPositionRef.current = { x: nextX, y: nextY }
          onMove(lastPositionRef.current)
        }
      })
    }

    setupCanvas()

    return () => {
      cancelled = true
      setCanvasReady(false)
      resizeObserver?.disconnect()
      appRef.current = null
      playerLayerRef.current = null
      destroyOnce()
    }
  }, [world, onMove])

  useEffect(() => {
    if (!canvasReady || !playerLayerRef.current) return

    const playerLayer = playerLayerRef.current
    const oldPlayers = playerLayer.removeChildren()
    oldPlayers.forEach((player) => player.destroy({ children: true }))

    const connectedIds = new Set(connections.map((user) => user.id))

    users.forEach((user) => {
      playerLayer.addChild(createPlayerSprite(user, user.id === me?.id, connectedIds.has(user.id)))
    })
  }, [canvasReady, users, connections, me])

  return (
    <div className="map-wrap">
      <div className="canvas-host" ref={hostRef}></div>
    </div>
  )
}
