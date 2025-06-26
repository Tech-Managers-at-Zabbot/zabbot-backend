import { Profile, VerifyCallback } from 'passport-google-oauth20';
import usersRepositories from "../../repositories/userRepositories/users.repositories";
import { v4 } from "uuid";
import { RegisterMethods, UserRoles } from "../../types/users.types";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { Response } from 'express'
import { GeneralResponses } from "../../responses/generalResponses/general.responses";
import { StatusCodes } from "../../responses/statusCodes/statusCodes.responses";
import { responseUtilities, errorUtilities } from "../../../../shared/utilities";
import { helperFunctions, endpointCallsUtilities } from "../../utilities/index";




dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
    LOCAL_FOUNDERS_LIST_URL: process.env.LOCAL_FOUNDERS_LIST_URL,
    NOTIFICATION_SERVICE_ROUTE: process.env.NOTIFICATION_SERVICE_ROUTE,
};

const googleOAuthVerify = async (
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

        if (!user) {
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
                    
                    // Pass custom error info to be used in failureRedirect
return done(new Error(errorMessage));
                    // return done(null, false, { message: errorMessage });
                }
            } catch (err: any) {
                console.log('📊 Error details:', {
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
                
                // Pass custom error info to be used in failureRedirect
            return done(new Error(customError));

                // return done(null, false, { message: customError });
            }

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

            user = await usersRepositories.create(createUserPayload);

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


        } else {
            await usersRepositories.updateOne(
                {
                    email: user.email
                },
                {
                    googleAccessToken: accessToken,
                    googleRefreshToken: refreshToken,
                }
            );
        }

        done(null, user);
    } catch (err) {
        return done(new Error('authentication_failed'));
        // done(null, false, { message: 'authentication_failed' });
    }
};


export default {
    googleOAuthVerify
}
