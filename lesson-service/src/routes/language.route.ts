import express from 'express';
import { getLanguages } from '../controllers/language.controllers';

const router = express.Router();

router.get('/languages', getLanguages)

export default router;