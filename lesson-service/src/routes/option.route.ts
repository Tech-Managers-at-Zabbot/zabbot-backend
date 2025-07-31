import express from 'express';
import { 
    getOptionsController,
    getOptionController,
    createOptionController,
    updateOptionController,
    deleteOptionController
 } from '../controllers/option.controller';

const router = express.Router();

// routes for questions
router.get('/', getOptionsController);
router.get('/:id', getOptionController);
router.post('/', createOptionController);
router.put('/:id', updateOptionController);
router.delete('/:id', deleteOptionController);

export default router;