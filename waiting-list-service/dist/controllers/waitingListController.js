"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUsersToRespectiveLists = exports.unsubscribeWaitingList = exports.joinWaitingList = exports.config = void 0;
const waitingList_1 = __importDefault(require("../entities/waitingList"));
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const utilities_1 = require("../../../shared/utilities");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
exports.config = {
    NOTIFICATION_SERVICE_ROUTE: process.env.NOTIFICATION_SERVICE_ROUTE
};
const joinWaitingList = async (request, response) => {
    try {
        const { name, email, country, sendUpdates, betaTest, contributeSkills } = request.body;
        if (!name || !email || !country) {
            response.status(400).json({ message: 'Name, email, and country are required' });
            return;
        }
        if (!sendUpdates && !betaTest && !contributeSkills) {
            response.status(400).json({ message: 'Please select at least one option' });
            return;
        }
        const existingUser = await waitingList_1.default.findOne({ where: { email } });
        if (existingUser) {
            response.status(409).json({ message: 'Email already exists in founders list' });
            return;
        }
        const newEntry = await waitingList_1.default.create({
            id: (0, uuid_1.v4)(),
            name,
            email,
            country,
            sendUpdates,
            betaTest,
            contributeSkills
        });
        response.status(201).json({
            message: 'Successfully joined founders list',
            data: newEntry
        });
        const emailData = {
            email,
            firstName: name.split(' ')[0],
            lastName: name.split(' ')[1] || "",
            country
        };
        axios_1.default.post(`${exports.config.NOTIFICATION_SERVICE_ROUTE}/founding-list/welcome-sendgrid`, emailData);
        if (sendUpdates) {
            axios_1.default.post(`${exports.config.NOTIFICATION_SERVICE_ROUTE}/founding-list/add-to-update-list`, emailData);
        }
        if (betaTest) {
            axios_1.default.post(`${exports.config.NOTIFICATION_SERVICE_ROUTE}/founding-list/add-to-testers-list`, emailData);
        }
        if (contributeSkills) {
            axios_1.default.post(`${exports.config.NOTIFICATION_SERVICE_ROUTE}/founding-list/add-to-contributors-list`, emailData);
        }
    }
    catch (error) {
        console.error(error);
        if (error.name === 'SequelizeValidationError') {
            response.status(400).json({
                message: 'Validation error',
                errors: error.errors.map((err) => err.message)
            });
            return;
        }
        response.status(500).json({ message: 'Server error' });
    }
};
exports.joinWaitingList = joinWaitingList;
const unsubscribeWaitingList = async (request, response) => {
    try {
        const { token } = request.query;
        if (!token) {
            throw utilities_1.errorUtilities.createError('Token is required', 400);
        }
        const decodedDetails = utilities_1.helpersUtilities.validateToken(token);
        if (!decodedDetails) {
            console.error('Invalid token');
            throw utilities_1.errorUtilities.createError('Error, please try again', 400);
        }
        const { email } = decodedDetails.data;
        if (!email) {
            throw utilities_1.errorUtilities.createError('Error, please try again', 400);
        }
        const existingUser = await waitingList_1.default.findOne({ where: { email } });
        if (!existingUser) {
            return response.status(404).json({ message: 'Email not found in founders list' });
        }
        const sendgridResponse = await axios_1.default.post(`${exports.config.NOTIFICATION_SERVICE_ROUTE}/founding-list/unsubscribe`, { email });
        if (sendgridResponse.status !== 200) {
            console.error('Failed to unsubscribe from SendGrid:', sendgridResponse.data, sendgridResponse.status, sendgridResponse);
            return response.status(500).json({ message: 'Failed to unsubscribe from SendGrid' });
        }
        await waitingList_1.default.destroy({ where: { email } });
        return response.status(200).json({
            message: 'Successfully unsubscribed from founders list'
        });
    }
    catch (error) {
        console.error(error);
        if (error.name === 'SequelizeValidationError') {
            response.status(400).json({
                message: 'Validation error',
                errors: error.errors.map((err) => err.message)
            });
            return;
        }
        response.status(500).json({ message: 'Server error' });
    }
};
exports.unsubscribeWaitingList = unsubscribeWaitingList;
const addUsersToRespectiveLists = async (request, response) => {
    try {
        const users = await waitingList_1.default.findAll({});
        if (!users || users.length === 0) {
            return response.status(200).json({
                message: 'No users found in waiting list',
                processed: 0
            });
        }
        let processedCount = 0;
        let errorCount = 0;
        const errors = [];
        // Process each user
        for (const user of users) {
            try {
                // Split name into firstName and lastName (assuming name is full name)
                const nameParts = user.name.trim().split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                const emailData = {
                    email: user.email,
                    firstName: firstName,
                    lastName: lastName,
                    country: user.country
                };
                // axios.post(`${config.NOTIFICATION_SERVICE_ROUTE}/founding-list/welcome-sendgrid`, emailData)
                const promises = [];
                if (user.sendUpdates) {
                    promises.push(axios_1.default.post(`${exports.config.NOTIFICATION_SERVICE_ROUTE}/founding-list/add-to-update-list`, emailData)
                        .catch(err => ({ error: 'update-list', details: err })));
                }
                if (user.betaTest) {
                    promises.push(axios_1.default.post(`${exports.config.NOTIFICATION_SERVICE_ROUTE}/founding-list/add-to-testers-list`, emailData)
                        .catch(err => ({ error: 'testers-list', details: err })));
                }
                if (user.contributeSkills) {
                    promises.push(axios_1.default.post(`${exports.config.NOTIFICATION_SERVICE_ROUTE}/founding-list/add-to-contributors-list`, emailData)
                        .catch(err => ({ error: 'contributors-list', details: err })));
                }
                // Wait for all API calls for this user to complete
                if (promises.length > 0) {
                    const results = await Promise.allSettled(promises);
                    // Check for any failed requests
                    const failedRequests = results.filter(result => result.status === 'fulfilled' && result.value?.error);
                    if (failedRequests.length > 0) {
                        errors.push({
                            userId: user.id,
                            email: user.email,
                            failures: failedRequests.map(req => req.value)
                        });
                        errorCount++;
                    }
                    else {
                        processedCount++;
                    }
                }
                else {
                    // User has no preferences selected, still count as processed
                    processedCount++;
                }
            }
            catch (userError) {
                console.error(`Error processing user ${user.id}:`, userError);
                errors.push({
                    userId: user.id,
                    email: user.email,
                    error: userError
                });
                errorCount++;
            }
        }
        // Return comprehensive response
        const responseData = {
            message: 'User processing completed',
            totalUsers: users.length,
            processedSuccessfully: processedCount,
            errorsEncountered: errorCount,
            ...(errors.length > 0 && { errors: errors })
        };
        if (errorCount > 0) {
            return response.status(207).json(responseData); // 207 Multi-Status
        }
        return response.status(200).json(responseData);
    }
    catch (error) {
        console.error(error);
        if (error.name === 'SequelizeValidationError') {
            response.status(400).json({
                message: 'Validation error',
                errors: error.errors.map((err) => err.message)
            });
            return;
        }
        response.status(500).json({ message: 'Server error' });
    }
};
exports.addUsersToRespectiveLists = addUsersToRespectiveLists;
