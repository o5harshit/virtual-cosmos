import { registerCosmosController } from '../controllers/cosmosController.js'

export function registerSocket(io) {
  return registerCosmosController(io)
}
