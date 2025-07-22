import { Request, Response } from "express";
import { authServices } from "../../services";
import { responseUtilities } from "../../utilities";
import { JwtPayload } from "jsonwebtoken";


const userRegister = async (
  request: Request,
  response: Response
): Promise<any> => {
  
  const newUser: any = await authServices.userRegister(
    request.body
  );

  return responseUtilities.responseHandler(
    response,
    newUser.message,
    newUser.statusCode,
    newUser.data
  );
};

const userLoginWithEmail = async (
  request: Request,
  response: Response
): Promise<any> => {
  const loggedInUser: any = await authServices.userLogin(request.body);

  if(loggedInUser.statusCode === 200){
  response
    .header("x-access-token", loggedInUser.data.accessToken)
    .header("x-refresh-token", loggedInUser.data.refreshToken);
  }
  
  return responseUtilities.responseHandler(
    response,
    loggedInUser.message,
    loggedInUser.statusCode,
    loggedInUser.data,
  );
};

export default {
  userRegister,
  userLoginWithEmail,
};