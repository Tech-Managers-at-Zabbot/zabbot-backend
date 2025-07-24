import { usersControllers } from '../../controllers';
import express, {Request, Response, NextFunction} from 'express';


const router = express.Router()

router.get('/single-user/:id', usersControllers.getSingleUser)



export default router