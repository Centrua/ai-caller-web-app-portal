import { Router } from 'express'
import { VenueController } from '../controllers/venue.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const venueController = new VenueController()

router.post('/', venueController.createVenue)
router.get('/', venueController.getAllVenues)
router.get('/name', authenticateToken, venueController.getVenueName)
router.get('/:id/associate-user', venueController.addAssociatedUser)

export default router