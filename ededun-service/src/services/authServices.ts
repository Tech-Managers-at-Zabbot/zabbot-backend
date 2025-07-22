import { errorUtilities, mailUtilities, responseUtilities } from "../utilities";
import validator from "validator";
import userRepository from "../repositories/userRepository";
import { Roles, UserAttributes } from "../types/modelTypes";
import { v4 } from 'uuid';
import generalHelpers from "../helpers/generalHelpers";

const userRegister = errorUtilities.withErrorHandling(
  async (userPayload: Record<string, any>): Promise<Record<string, any>> => {

    let { email, password, firstName, lastName, phone, gender, ageGroup } = userPayload;

    email = email.trim();

    if (!validator.isEmail(email)) {
      throw errorUtilities.createError('Invalid email address', 400);
    }

    const existingUser = (await userRepository.userRepositories.getOne({
      email,
    })) as unknown as UserAttributes;

    if (existingUser) {
      throw errorUtilities.createError(
        'Email already in use, please login or use another email',
        400
      );
    }

    const userId = v4();

    const userCreationPayload = {
      id: userId,
      email,
      password,
      firstName,
      lastName,
      phone,
      role: Roles.User,
      gender,
      ageGroup
    };

    const newUser = await userRepository.userRepositories.create(
      userCreationPayload
    );

    if (!newUser) {
      throw errorUtilities.createError(
        'Unable to create, please try again or contact the admin',
        400
      );
    }

    const user: any = await userRepository.userRepositories.getOne({
      id: userId,
    });

    try{
      await mailUtilities.sendMail(
        email,
        'Welcome to Èdèdún AI Powered Yorùbá Platform! We look forward to your valuable contribution',
        'Welcome to Èdèdún APYP'
      );
    }catch(error:any){
      console.error(`Error: ${error}`)
    }

    return responseUtilities.handleServicesResponse(201, "User created successfully, welcome to Èdèdún AI Powered Yorùbá Platform!", user);
  }
);


const userLogin = errorUtilities.withErrorHandling(
  async (loginPayload: Record<string, any>) => {

    const { email, password } = loginPayload;

    const filter = { email: email.trim() };

    const existingUser: any = await userRepository.userRepositories.getOne(
      filter
    ) as unknown as UserAttributes;

    if (!existingUser) {
      throw errorUtilities.createError('Email does not exist in our database, please check again', 404);
    }

    const verifyPassword = await generalHelpers.comparePasswords(
      password.trim(),
      existingUser.password
    );

    if (!verifyPassword) {
      throw errorUtilities.createError(
        'Incorrect Password, please check and try again',
        400
      );
    }

    const tokenPayload = {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    };

    const accessToken = await generalHelpers.generateTokens(tokenPayload, "30d");
    const refreshToken = await generalHelpers.generateTokens(
      tokenPayload,
      "30d"
    );

    let mailMessage = "";
    let mailSubject = "";

    if (!existingUser.refreshToken) {
      mailMessage = `Welcome to Welcome to Èdèdún APYP, ${existingUser.firstName}. We are excited to have you on board!`;
      mailSubject = `Welcome ${existingUser.firstName}`;
    } else {
      mailSubject = 'Welcome Back';
      mailMessage = `Welcome back ${existingUser.firstName}, it is great to have you back`;
    }

    existingUser.refreshToken = refreshToken;

    await userRepository.userRepositories.updateOne({ email }, { refreshToken: refreshToken })

    const newExistingUser: any =
      await userRepository.userRepositories.getOne(filter);


    const userWithoutPassword = await userRepository.userRepositories.extractUserDetails(newExistingUser)

    try{
      await mailUtilities.sendMail(existingUser.email, mailMessage, mailSubject);
    }catch(error:any){
      console.error(`Error: ${error
      }`)
    }


    return responseUtilities.handleServicesResponse(200, 'Login Successful, Welcome Back', { user: userWithoutPassword, accessToken, refreshToken });
  }
);




export default {
  userRegister,
  userLogin
}