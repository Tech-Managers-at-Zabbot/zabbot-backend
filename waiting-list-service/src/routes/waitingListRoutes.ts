import { Router } from 'express';
import { joinWaitingList } from '../controllers/waitingListController';

const router = Router();

router.post('/join', joinWaitingList);

export default router;