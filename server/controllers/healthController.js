import { PROXIMITY_RADIUS } from '../config/index.js'

export function createHealthController(cosmosService) {
  return function getHealth(req, res) {
    res.json({
      ok: true,
      users: cosmosService.getUserCount(),
      activeRooms: cosmosService.getRoomCount(),
      proximityRadius: PROXIMITY_RADIUS,
    })
  }
}
