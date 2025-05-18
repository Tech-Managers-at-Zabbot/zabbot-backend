"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const emailControllers_1 = __importDefault(require("../../controllers/emailControllers"));
const router = express_1.default.Router();
router.post('/welcome-sendgrid', emailControllers_1.default.sendgridExecuteFoundingListNotification);
router.post('/welcome-mailchimp', emailControllers_1.default.mailChimpExecuteFoundingListNotification);
router.post('/unsubscribe', emailControllers_1.default.sendgridUnsubscribeFoundingListNotification);
exports.default = router;
