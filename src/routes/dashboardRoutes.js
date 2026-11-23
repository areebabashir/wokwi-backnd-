import {Router} from 'express';
import {dashboardAuth} from '../middleware/auth.js';
import {getDashboard} from '../controllers/dashboardController.js';
const router=Router();router.get('/',dashboardAuth,getDashboard);export default router;
