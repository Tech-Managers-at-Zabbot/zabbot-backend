import express from "express";
import multer from "multer";
import { usersControllers } from "../../controllers";
import { generalAuthFunction } from "../../../../shared/middleware/authorization.middleware";
import streakController from "../../controllers/userControllers/streak.controller";

const router = express.Router();

router.get("/single-user/:userId", usersControllers.getSingleUser);
router.get("/all-user-count", usersControllers.getAllUsersCount);
router.post(
  "/log-streak",
  generalAuthFunction,
  streakController.logStreakController,
);

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/change-profile-picture",
  upload.array("files", 50),
  generalAuthFunction,
  usersControllers.changeUserProfilePicture,
);

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

export default router;
