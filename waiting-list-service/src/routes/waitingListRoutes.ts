import { Router } from 'express';
import { joinWaitingList, unsubscribeWaitingList } from '../controllers/waitingListController';

const router = Router();

router.post('/join', joinWaitingList);
router.get('/unsubscribe', unsubscribeWaitingList)

export default router;