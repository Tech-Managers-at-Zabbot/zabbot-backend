import { Profile, VerifyCallback } from 'passport-google-oauth20';
import usersRepositories from "../../repositories/userRepositories/users.repositories";
import { v4 } from "uuid";
import { RegisterMethods, UserRoles } from "../../types/users.types";
import axios from "axios";
import { Response } from 'express'
import { GeneralResponses } from "../../responses/generalResponses/general.responses";
import { StatusCodes } from "../../responses/statusCodes/statusCodes.responses";
import { responseUtilities, errorUtilities } from "../../../../shared/utilities";
import { helperFunctions, endpointCallsUtilities } from "../../utilities/index";
import config from '../../../../config/config';
import userRepositories from '../../repositories/userRepositories/users.repositories';

const googleOAuthRegister = async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
) => {
    try {
        let user = await usersRepositories.getOne(
            { email: profile.emails?.[0].value },
            ["id", "email"]
        );

        if (user) {
            return done(new Error('user_already_exists'));
        }

        try {
            const isBetaTester = await axios.get(
                `${config.LOCAL_FOUNDERS_LIST_URL}/beta-tester-check?email=${profile.emails?.[0].value}`,
                {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (isBetaTester.status !== StatusCodes.OK) {
                const errorMessage = isBetaTester.status === StatusCodes.Forbidden
                    ? 'unauthorized_for_testing'
                    : 'failed_tester_check';
                
                return done(new Error(errorMessage));
            }
        } catch (err: any) {
            console.log('📊 Registration Error details:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                code: err.code
            });
            
            let customError = 'authentication_failed';
            if (err.response?.status === StatusCodes.NotFound) {
                customError = 'signup_as_tester';
            } else if (err.response?.status === 403) {
                customError = 'unauthorized_for_testing';
            } else {
                customError = 'failed_tester_check';
            }
            
            return done(new Error(customError));
        }

        // Create new user
        const createUserPayload = {
            id: v4(),
            firstName: profile?.name?.givenName || '',
            lastName: profile?.name?.familyName || '',
            email: profile?.emails?.[0].value || '',
            isVerified: true,
            isActive: true,
            isBlocked: false,
            isFirstTimeLogin: true,
            role: UserRoles.USER,
            profilePicture: profile?.photos?.[0].value,
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken,
            registerMethod: RegisterMethods.GOOGLE
        };

        await usersRepositories.create(createUserPayload);

        const newUser:any = await userRepositories.getByPK(createUserPayload.id)

          const accessTokenData = {
      data: {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      expires: "2h",
    };

    const refreshTokenData = {
      data: {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      expires: "30d",
    };

    const appAccessToken = helperFunctions.generateToken(accessTokenData);
    const appRefreshToken = helperFunctions.generateToken(refreshTokenData);

       await userRepositories.updateOne(
      {
        id: newUser.id,
      },
      {
        refreshToken:appRefreshToken
      }
    );

     const userDetails = await usersRepositories.extractUserDetails(newUser);

        const emailData = {
            email: createUserPayload.email,
            firstName: createUserPayload.firstName,
        }

        const emailPayload = {
            url: `${config.NOTIFICATION_SERVICE_ROUTE}/auth-notification/welcome-otp`,
            emailData
        }

        endpointCallsUtilities.processEmailsInBackground(emailPayload).catch(error => {
            console.error(`Background email processing failed for ${createUserPayload.email}:`, error.message);
        });
        
        done(null, { token:appAccessToken, user:userDetails, authType: 'registration' });
    } catch (err) {
        return done(new Error('registration_failed'));
    }
};

const googleOAuthLogin = async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
) => {
    try {
        let user = await usersRepositories.getOne(
            { email: profile.emails?.[0].value },
            ["id", "email", "firstName", "lastName", "isActive", "isBlocked"]
        );

        if (!user) {
            return done(new Error('user_not_found_please_register'));
        }

        if (!user.isActive || user.isBlocked) {
            return done(new Error('account_inactive_or_blocked'));
        }

    const newUser:any = await userRepositories.getByPK(user.id)

          const accessTokenData = {
      data: {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      expires: "2h",
    };

    const refreshTokenData = {
      data: {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      expires: "30d",
    };

    const appAccessToken = helperFunctions.generateToken(accessTokenData);
    const appRefreshToken = helperFunctions.generateToken(refreshTokenData);

            await usersRepositories.updateOne(
            { email: user.email },
            {
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken,
                refreshToken:appRefreshToken
            }
        );

     const userDetails = await usersRepositories.extractUserDetails(newUser);


        done(null, { token:appAccessToken, user:userDetails, authType: 'login' });
   
    } catch (err) {
        return done(new Error('login_failed'));
    }
};



export default {
    googleOAuthRegister,
googleOAuthLogin
}
