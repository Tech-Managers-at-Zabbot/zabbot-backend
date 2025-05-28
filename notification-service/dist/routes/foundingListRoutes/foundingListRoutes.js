"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const emailControllers_1 = __importDefault(require("../../controllers/emailControllers"));
const validations_1 = require("../../validations");
const router = express_1.default.Router();
router.post('/welcome-sendgrid', emailControllers_1.default.sendgridExecuteFoundingListNotification);
router.post('/welcome-mailchimp', emailControllers_1.default.mailChimpExecuteFoundingListNotification);
router.post('/unsubscribe', emailControllers_1.default.sendgridUnsubscribeFoundingListNotification);
router.post('/add-list-field', validations_1.joiValidators.inputValidator(validations_1.joiValidators.addCustomFieldSchema), emailControllers_1.default.addFieldToListController);
router.post('/add-to-update-list', validations_1.joiValidators.inputValidator(validations_1.joiValidators.addToSendgridListSchema), emailControllers_1.default.addUsersToUpdateListController);
router.post('/add-to-testers-list', validations_1.joiValidators.inputValidator(validations_1.joiValidators.addToSendgridListSchema), emailControllers_1.default.addUsersToTestersController);
router.post('/add-to-contributors-list', validations_1.joiValidators.inputValidator(validations_1.joiValidators.addToSendgridListSchema), emailControllers_1.default.addUsersToContributorsController);
exports.default = router;
