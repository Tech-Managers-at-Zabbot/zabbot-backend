import { Router } from 'express';
import { joinWaitingList, unsubscribeWaitingList, addUsersToRespectiveLists, getWaitingListBetaTesterUser } from '../controllers/waitingListController';



const router = Router();



router.post('/join', joinWaitingList);
router.get('/unsubscribe', unsubscribeWaitingList);
router.get('/split-to-lists', addUsersToRespectiveLists);
router.get('/beta-tester-check', getWaitingListBetaTesterUser)




export default router;