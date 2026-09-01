import { Router } from 'express'
import { DashboardController } from '../controllers/dashboard.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const dashboardController = new DashboardController()

router.get('/', authenticateToken, dashboardController.getDashboardMetrics)

export default router