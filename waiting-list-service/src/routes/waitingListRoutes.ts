import { Router } from 'express';
import { joinWaitingList, unsubscribeWaitingList, addUsersToRespectiveLists } from '../controllers/waitingListController';



const router = Router();



router.post('/join', joinWaitingList);
router.get('/unsubscribe', unsubscribeWaitingList);
router.get('/split-to-lists', addUsersToRespectiveLists);




export default router;