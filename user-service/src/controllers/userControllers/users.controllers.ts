import { userServices } from "../../services";
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import { Request, Response } from 'express';
import { helpersUtilities } from '../../../../shared/utilities';


const getSingleUser = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
    let { projection } = request.query;
    const { userId } = request.params

    if(projection){
        projection = helpersUtilities.parseStringified(projection)
    }
    const userDetails = await userServices.getSingleUserService(userId, projection)
    return responseUtilities.responseHandler(
        response,
        userDetails.message,
        userDetails.statusCode,
        userDetails.data
    )
})

const getAllUsersCount = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {

    const userCount = await userServices.getAllUserCountService()
    return responseUtilities.responseHandler(
        response,
        userCount.message,
        userCount.statusCode,
        userCount.data
    )
})



export default {
    getSingleUser,
    getAllUsersCount
}