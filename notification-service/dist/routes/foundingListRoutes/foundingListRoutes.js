"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../../controllers");
const validations_1 = require("../../validations");
const router = express_1.default.Router();
router.post('/welcome-sendgrid', controllers_1.emailControllers.sendgridExecuteFoundingListNotification);
router.post('/welcome-mailchimp', controllers_1.emailControllers.mailChimpExecuteFoundingListNotification);
router.post('/unsubscribe', controllers_1.emailControllers.sendgridUnsubscribeFoundingListNotification);
router.post('/add-list-field', validations_1.joiValidators.inputValidator(validations_1.joiValidators.addCustomFieldSchema), controllers_1.emailControllers.addFieldToListController);
router.post('/add-to-update-list', validations_1.joiValidators.inputValidator(validations_1.joiValidators.addToSendgridListSchema), controllers_1.emailControllers.addUsersToUpdateListController);
router.post('/add-to-testers-list', validations_1.joiValidators.inputValidator(validations_1.joiValidators.addToSendgridListSchema), controllers_1.emailControllers.addUsersToTestersController);
router.post('/add-to-contributors-list', validations_1.joiValidators.inputValidator(validations_1.joiValidators.addToSendgridListSchema), controllers_1.emailControllers.addUsersToContributorsController);
exports.default = router;
