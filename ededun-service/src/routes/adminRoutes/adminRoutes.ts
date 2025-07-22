import express from 'express';
import { joiValidators } from '../../validations';
// import { generalAuthFunction } from '../../middlewares/authorization';
// import { cloudinaryUtilities } from '../../utilities';
import { adminControllers } from '../../controllers';

const router = express.Router();

router.post('/create-phrase', joiValidators.inputValidator(joiValidators.createPhraseSchema), adminControllers.adminCreatePhrase)
router.put('/update-phrase/:phraseId', adminControllers.adminUpdatesPhrase)
router.delete('/delete-phrase/:phraseId', adminControllers.adminDeletesPhrase)
router.post('/add-many-phrases', adminControllers.adminCreatesManyPhrases)
router.post('/cleanup-cloudinary-files', adminControllers.adminDeletesCloudinaryLeftOverRecordings);


export default router;