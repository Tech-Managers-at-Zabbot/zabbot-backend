import { usersControllers } from '../../controllers';
import express from 'express';


const router = express.Router()

router.get('/single-user/:userId', usersControllers.getSingleUser)
router.get('/all-user-count', usersControllers.getAllUsersCount)


export default router