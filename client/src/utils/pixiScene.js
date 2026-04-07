import { Container, Graphics, Text } from 'pixi.js'

const PROXIMITY_RADIUS = 120

function colorToNumber(color) {
  return Number(`0x${color.replace('#', '')}`)
}

export function drawGrid(world) {
  const grid = new Graphics()
  grid.stroke({ color: 0x263244, alpha: 0.8, width: 1 })

  for (let x = 0; x <= world.width; x += 60) {
    grid.moveTo(x, 0).lineTo(x, world.height)
  }

  for (let y = 0; y <= world.height; y += 60) {
    grid.moveTo(0, y).lineTo(world.width, y)
  }

  return grid
}

export function createPlayerSprite(user, isMe, isConnected) {
  const player = new Container()

  if (isMe || isConnected) {
    const zone = new Graphics()
    zone.circle(0, 0, PROXIMITY_RADIUS)
      .fill({ color: isConnected ? 0x14b8a6 : 0x2563eb, alpha: 0.08 })
      .stroke({ color: isConnected ? 0x14b8a6 : 0x2563eb, alpha: 0.35, width: 2 })
    player.addChild(zone)
  }

  const avatar = new Graphics()
  avatar.circle(0, 0, isMe ? 18 : 15)
    .fill({ color: colorToNumber(user.color) })
    .stroke({ color: 0xffffff, width: 3 })
  player.addChild(avatar)

  const label = new Text({
    text: isMe ? `${user.name} (you)` : user.name,
    style: {
      fontFamily: 'Arial',
      fontSize: 13,
      fill: 0xe5e7eb,
    },
  })

  label.anchor.set(0.5)
  label.y = 30
  player.addChild(label)

  player.x = user.x
  player.y = user.y
  return player
}

export function safeDestroyPixiApp(app) {
  if (!app) return

  try {
    app.stop()

    if (typeof app._cancelResize !== 'function') {
      app._cancelResize = () => {}
    }

    app.destroy(true, { children: true, texture: true })
  } catch (error) {
    console.warn('Pixi cleanup skipped:', error.message)
  }
}
