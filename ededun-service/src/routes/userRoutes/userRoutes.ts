import express from 'express';
import { joiValidators } from '../../validations';
import { generalAuthFunction } from '../../middlewares/authorization';
import { authController, userController } from '../../controllers';
import upload from '../../utilities/cloudinary';

const router = express.Router();


router.post('/register', joiValidators.inputValidator(joiValidators.userRegisterSchemaViaEmail), authController.userRegister)
router.post('/login', joiValidators.inputValidator(joiValidators.loginUserSchemaViaEmail), authController.userLoginWithEmail)
router.post('/save-recording', generalAuthFunction, upload, userController.userAddsRecording)
router.get('/all-my-recordings', generalAuthFunction, userController.userGetsAllTheirRecordings)
router.get('/unrecorded-phrases', generalAuthFunction, userController.userGetsUnrecordedPhrases)
router.delete('/delete-my-recording/:recordingId', generalAuthFunction, userController.userDeletesSingleRecording)


export default router;