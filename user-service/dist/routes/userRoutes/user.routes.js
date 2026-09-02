"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const controllers_1 = require("../../controllers");
const authorization_middleware_1 = require("../../../../shared/middleware/authorization.middleware");
const streak_controller_1 = __importDefault(require("../../controllers/userControllers/streak.controller"));
const router = express_1.default.Router();
router.get("/single-user/:userId", controllers_1.usersControllers.getSingleUser);
router.get("/all-user-count", controllers_1.usersControllers.getAllUsersCount);
router.post("/log-streak", authorization_middleware_1.generalAuthFunction, streak_controller_1.default.logStreakController);
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post("/change-profile-picture", upload.array("files", 50), authorization_middleware_1.generalAuthFunction, controllers_1.usersControllers.changeUserProfilePicture);
/**
 * DELETE /api/media/delete
 * Delete single or multiple files
 */
// router.delete('/delete', async (req: Request, res: Response) => {
//   try {
//     const { publicIds, mediaType } = req.body;
//     if (!Array.isArray(publicIds) || publicIds.length === 0 || !mediaType) {
//       return res.status(400).json({ error: 'Invalid request body' });
//     }
//     await CloudinaryService.deleteFiles(publicIds, mediaType as MediaType);
//     res.json({ success: true });
//   } catch (error) {
//     res.status(500).json({
//       error: error instanceof Error ? error.message : 'Delete failed',
//     });
//   }
// });
/**
 * GET /api/media/signature
 * Generate upload signature for client-side uploads (optional)
 */
// router.get('/signature', (req: Request, res: Response) => {
//   try {
//     const folder = req.query.folder as string;
//     const mediaType = req.query.mediaType as string;
//     if (!folder || !mediaType) {
//       return res.status(400).json({ error: 'Missing folder or mediaType' });
//     }
//     const signature = CloudinaryService.generateUploadSignature(
//       folder,
//       mediaType as MediaType
//     );
//     res.json(signature);
//   } catch (error) {
//     res.status(500).json({
//       error: error instanceof Error ? error.message : 'Token generation failed',
//     });
//   }
// });
exports.default = router;
