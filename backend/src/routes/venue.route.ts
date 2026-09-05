import { Router } from 'express'
import { VenueController } from '../controllers/venue.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const venueController = new VenueController()

router.post('/', venueController.createVenue)
router.get('/name', authenticateToken, venueController.getVenueName)
router.get('/:id/settings', authenticateToken, venueController.getSettings)
router.patch('/:id/settings', authenticateToken, venueController.updateSettings)

export default router