import { Router } from 'express'
import { createHealthController } from '../controllers/healthController.js'

export function createHealthRoutes(cosmosService) {
  const router = Router()

  router.get('/health', createHealthController(cosmosService))

  return router
}
