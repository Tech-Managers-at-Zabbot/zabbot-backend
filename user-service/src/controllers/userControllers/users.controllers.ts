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



export default {
    getSingleUser
}