"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSingleUser = exports.fetchEdedunLanguageBatches = exports.fetchEdedunLanguage = void 0;
const axios_1 = __importDefault(require("axios"));
const fetchEdedunLanguage = async (englishText, yorubaText) => {
    try {
        const params = new URLSearchParams();
        if (englishText) {
            params.append('englishText', englishText);
        }
        if (yorubaText) {
            params.append('yorubaText', yorubaText);
        }
        const queryString = params.toString();
        const url = `http://localhost:3006/admin/recordings-for-zabbot${queryString ? '?' + queryString : ''}`;
        const response = await axios_1.default.get(url);
        return {
            success: true,
            statusCode: response.status,
            data: response.data.data,
            message: response.data.message || 'Fetched successfully',
        };
    }
    catch (error) {
        return {
            success: false,
            statusCode: error.response?.status || 500,
            data: null,
            message: error.response?.data?.message || error.message || 'Failed to fetch from Ededun',
        };
    }
};
exports.fetchEdedunLanguage = fetchEdedunLanguage;
const fetchEdedunLanguageBatches = async (wordArr) => {
    try {
        const params = new URLSearchParams();
        const newArr = JSON.stringify(wordArr);
        params.append('phrases', newArr);
        const queryString = params.toString();
        const url = `http://localhost:3006/admin/many-recordings${queryString ? '?' + queryString : ''}`;
        const response = await axios_1.default.get(url);
        return {
            success: true,
            statusCode: response.status,
            data: response.data.data,
            message: response.data.message || 'Fetched successfully',
        };
    }
    catch (error) {
        return {
            success: false,
            statusCode: error.response?.status || 500,
            data: null,
            message: error.response?.data?.message || error.message || 'Failed to fetch from Ededun',
        };
    }
};
exports.fetchEdedunLanguageBatches = fetchEdedunLanguageBatches;
const fetchSingleUser = async (userId, projection) => {
    try {
        const params = new URLSearchParams();
        if (projection) {
            params.append('projection', JSON.stringify(projection));
        }
        const queryString = params.toString();
        const url = `http://localhost:3004/users/single-user/${userId}${queryString ? '?' + queryString : ''}`;
        const response = await axios_1.default.get(url);
        return {
            success: true,
            statusCode: response.status,
            data: response.data.data,
            message: response.data.message || 'Fetched successfully',
        };
    }
    catch (error) {
        return {
            success: false,
            statusCode: error.response?.status || 500,
            data: null,
            message: error.response?.data?.message || error.message || 'Failed to fetch from Ededun',
        };
    }
};
exports.fetchSingleUser = fetchSingleUser;
