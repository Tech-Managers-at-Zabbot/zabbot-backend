"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const waitingListController_1 = require("../controllers/waitingListController");
const router = (0, express_1.Router)();
router.post('/join', waitingListController_1.joinWaitingList);
router.get('/unsubscribe', waitingListController_1.unsubscribeWaitingList);
router.get('/split-to-lists', waitingListController_1.addUsersToRespectiveLists);
exports.default = router;
