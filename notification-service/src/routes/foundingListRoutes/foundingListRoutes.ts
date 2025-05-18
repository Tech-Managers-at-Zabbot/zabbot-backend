import express from 'express';
import emailControllers from '../../controllers/emailControllers';


const router = express.Router()


router.post('/welcome-sendgrid', emailControllers.sendgridExecuteFoundingListNotification)
router.post('/welcome-mailchimp', emailControllers.mailChimpExecuteFoundingListNotification)
router.post('/unsubscribe', emailControllers.sendgridUnsubscribeFoundingListNotification)


export default router;