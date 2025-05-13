import express from 'express';
import { executeFoundingListNotification } from '../../controllers/mailChimpControllers';


const router = express.Router()


router.post('/welcome', executeFoundingListNotification)


export default router;