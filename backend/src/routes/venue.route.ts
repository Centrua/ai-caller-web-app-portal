import { Router } from 'express'
import { VenueController } from '../controllers/venue.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const venueController = new VenueController()

router.get('/name', authenticateToken, venueController.getVenueName)

export default router