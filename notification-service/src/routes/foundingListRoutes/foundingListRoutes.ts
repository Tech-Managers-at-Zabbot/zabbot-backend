import express from 'express';
import { emailControllers } from '../../controllers';
import { joiValidators } from '../../validations';


const router = express.Router()


router.post('/welcome-sendgrid', emailControllers.sendgridExecuteFoundingListNotification)
router.post('/welcome-mailchimp', emailControllers.mailChimpExecuteFoundingListNotification)
router.post('/unsubscribe', emailControllers.sendgridUnsubscribeFoundingListNotification)
router.post('/add-list-field', joiValidators.inputValidator(joiValidators.addCustomFieldSchema), emailControllers.addFieldToListController)
router.post('/add-to-update-list', joiValidators.inputValidator(joiValidators.addToSendgridListSchema), emailControllers.addUsersToUpdateListController)
router.post('/add-to-testers-list', joiValidators.inputValidator(joiValidators.addToSendgridListSchema), emailControllers.addUsersToTestersController)
router.post('/add-to-contributors-list', joiValidators.inputValidator(joiValidators.addToSendgridListSchema), emailControllers.addUsersToContributorsController)



export default router;