import {Router} from 'express';
import {deviceAuth,dashboardAuth} from '../middleware/auth.js';
import {createReading,listReadings} from '../controllers/sensorController.js';
const router=Router();
router.post('/',deviceAuth,createReading);
router.get('/',dashboardAuth,listReadings);
export default router;
