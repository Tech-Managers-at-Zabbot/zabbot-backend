"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../utilities");
const validator_1 = __importDefault(require("validator"));
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const modelTypes_1 = require("../types/modelTypes");
const uuid_1 = require("uuid");
const generalHelpers_1 = __importDefault(require("../helpers/generalHelpers"));
const userRegister = utilities_1.errorUtilities.withErrorHandling(async (userPayload) => {
    let { email, password, firstName, lastName, phone, gender, ageGroup } = userPayload;
    email = email.trim();
    if (!validator_1.default.isEmail(email)) {
        throw utilities_1.errorUtilities.createError('Invalid email address', 400);
    }
    const existingUser = (await userRepository_1.default.userRepositories.getOne({
        email,
    }));
    if (existingUser) {
        throw utilities_1.errorUtilities.createError('Email already in use, please login or use another email', 400);
    }
    const userId = (0, uuid_1.v4)();
    const userCreationPayload = {
        id: userId,
        email,
        password,
        firstName,
        lastName,
        phone,
        role: modelTypes_1.Roles.User,
        gender,
        ageGroup
    };
    const newUser = await userRepository_1.default.userRepositories.create(userCreationPayload);
    if (!newUser) {
        throw utilities_1.errorUtilities.createError('Unable to create, please try again or contact the admin', 400);
    }
    const user = await userRepository_1.default.userRepositories.getOne({
        id: userId,
    });
    try {
        await utilities_1.mailUtilities.sendMail(email, 'Welcome to Èdèdún AI Powered Yorùbá Platform! We look forward to your valuable contribution', 'Welcome to Èdèdún APYP');
    }
    catch (error) {
        console.error(`Error: ${error}`);
    }
    return utilities_1.responseUtilities.handleServicesResponse(201, "User created successfully, welcome to Èdèdún AI Powered Yorùbá Platform!", user);
});
const userLogin = utilities_1.errorUtilities.withErrorHandling(async (loginPayload) => {
    const { email, password } = loginPayload;
    const filter = { email: email.trim() };
    const existingUser = await userRepository_1.default.userRepositories.getOne(filter);
    if (!existingUser) {
        throw utilities_1.errorUtilities.createError('Email does not exist in our database, please check again', 404);
    }
    const verifyPassword = await generalHelpers_1.default.comparePasswords(password.trim(), existingUser.password);
    if (!verifyPassword) {
        throw utilities_1.errorUtilities.createError('Incorrect Password, please check and try again', 400);
    }
    const tokenPayload = {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
    };
    const accessToken = await generalHelpers_1.default.generateTokens(tokenPayload, "30d");
    const refreshToken = await generalHelpers_1.default.generateTokens(tokenPayload, "30d");
    let mailMessage = "";
    let mailSubject = "";
    if (!existingUser.refreshToken) {
        mailMessage = `Welcome to Welcome to Èdèdún APYP, ${existingUser.firstName}. We are excited to have you on board!`;
        mailSubject = `Welcome ${existingUser.firstName}`;
    }
    else {
        mailSubject = 'Welcome Back';
        mailMessage = `Welcome back ${existingUser.firstName}, it is great to have you back`;
    }
    existingUser.refreshToken = refreshToken;
    await userRepository_1.default.userRepositories.updateOne({ email }, { refreshToken: refreshToken });
    const newExistingUser = await userRepository_1.default.userRepositories.getOne(filter);
    const userWithoutPassword = await userRepository_1.default.userRepositories.extractUserDetails(newExistingUser);
    try {
        await utilities_1.mailUtilities.sendMail(existingUser.email, mailMessage, mailSubject);
    }
    catch (error) {
        console.error(`Error: ${error}`);
    }
    return utilities_1.responseUtilities.handleServicesResponse(200, 'Login Successful, Welcome Back', { user: userWithoutPassword, accessToken, refreshToken });
});
exports.default = {
    userRegister,
    userLogin
};
