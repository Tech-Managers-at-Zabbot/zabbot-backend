import express from 'express';
import { createLanguage, getLanguage, getLanguages, updateLanguage } from '../controllers/language.controller';

const router = express.Router();

router.get('/languages', getLanguages);
router.get('/languages/:id', getLanguage);
router.post('/languages', createLanguage);
router.put('/languages/:id', updateLanguage);

export default router;