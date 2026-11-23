import {Router} from 'express';
import {deviceAuth,dashboardAuth} from '../middleware/auth.js';
import {createEvent,listEvents} from '../controllers/eventController.js';
const router=Router();
router.post('/',deviceAuth,createEvent);
router.get('/',dashboardAuth,listEvents);
export default router;
