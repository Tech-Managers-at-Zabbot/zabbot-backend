"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalAuthFunction = void 0;
exports.rolePermit = rolePermit;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utilities_1 = require("../utilities");
const users_entities_1 = __importDefault(require("../entities/user-service-entities/users/users.entities"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generalAuthFunction = async (request, response, next) => {
    try {
        const authorizationHeader = request.headers.authorization;
        if (!authorizationHeader) {
            return response.status(403).json({
                status: 'Failed',
                message: 'Please login again',
            });
        }
        const authorizationToken = authorizationHeader.split(' ')[1];
        if (!authorizationToken) {
            return response.status(403).json({
                status: 'Failed',
                message: 'Login required',
            });
        }
        let verifiedUser;
        try {
            verifiedUser = jsonwebtoken_1.default.verify(authorizationToken, `${process.env.APP_JWT_SECRET}`);
            const decodedToken = jsonwebtoken_1.default.decode(authorizationToken);
            const projection = ['refreshToken', 'isVerified', "isActive", "isBlocked", "role", "accessToken", "id"];
            const userDetails = await users_entities_1.default.findOne({ where: { id: decodedToken?.userId }, attributes: projection, raw: true });
            if (!userDetails) {
                return response.status(403).json({
                    status: 'error',
                    message: 'User not found, please login again or contact admin',
                });
            }
            if (userDetails?.isBlocked) {
                return response.status(403).json({
                    status: 'error',
                    message: 'Account blocked, please contact admin',
                });
            }
            if (!userDetails.refreshToken) {
                return response.status(403).json({
                    status: 'error',
                    message: 'Please login again.',
                });
            }
        }
        catch (error) {
            if (error.message === 'jwt expired') {
                const decodedToken = jsonwebtoken_1.default.decode(authorizationToken);
                if (!decodedToken?.userId) {
                    return response.status(403).json({
                        status: 'error',
                        message: 'Invalid token',
                    });
                }
                const projection = ['refreshToken', 'isVerified', "isActive", "isBlocked", "role", "accessToken", "id"];
                const userDetails = await users_entities_1.default.findOne({ where: { id: decodedToken?.userId }, attributes: projection, raw: true });
                if (!userDetails) {
                    return response.status(403).json({
                        status: 'error',
                        message: 'User not found, please login again or contact admin',
                    });
                }
                const refreshToken = userDetails?.refreshToken;
                let refreshVerifiedUser;
                try {
                    refreshVerifiedUser = jsonwebtoken_1.default.verify(refreshToken, `${process.env.APP_JWT_SECRET}`);
                }
                catch (refreshError) {
                    return response.status(403).json({
                        status: 'error',
                        message: 'Refresh Token Expired. Please login again.',
                    });
                }
                if (!userDetails) {
                    return response.status(403).json({
                        status: 'error',
                        message: 'User not found, please login again or contact admin',
                    });
                }
                if (userDetails?.isBlocked) {
                    return response.status(403).json({
                        status: 'error',
                        message: 'Account blocked, please contact admin',
                    });
                }
                const compareRefreshTokens = refreshToken === userDetails?.refreshToken;
                if (compareRefreshTokens === false) {
                    return response.status(403).json({
                        status: 'error',
                        message: 'Please login again.',
                    });
                }
                const tokenPayload = {
                    id: refreshVerifiedUser.id,
                    email: refreshVerifiedUser.email,
                    role: refreshVerifiedUser.role
                };
                const newAccessToken = utilities_1.helpersUtilities.generateToken(tokenPayload, '2h');
                const newRefreshToken = utilities_1.helpersUtilities.generateToken(tokenPayload, '30d');
                response.setHeader('x-access-token', newAccessToken);
                await users_entities_1.default.update({
                    refreshToken: newRefreshToken
                }, {
                    where: { id: refreshVerifiedUser.id }
                });
                request.user = refreshVerifiedUser;
                return next();
            }
            return response.status(403).json({
                status: 'error',
                message: `Login Again, Invalid Token: ${error.message}`,
            });
        }
        request.user = verifiedUser;
        return next();
    }
    catch (error) {
        return response.status(500).json({
            status: 'error',
            message: `Internal Server Error: ${error.message}`,
        });
    }
};
exports.generalAuthFunction = generalAuthFunction;
function rolePermit(roles) {
    return async (request, response, next) => {
        const userRole = request.user.role;
        const { userId } = request.user;
        if (!userRole || !userId) {
            return response.status(403).json({
                status: 'error',
                message: 'User Not Authorized. Please login again',
            });
        }
        const isAuthorized = roles.includes(userRole);
        if (!isAuthorized) {
            return response.status(401).json({
                status: 'error',
                message: 'Not Permitted For Action',
            });
        }
        next();
    };
}
