import merge from 'lodash.merge'
import dotenvFlow from 'dotenv-flow'

const stage = process.env.NODE_ENV || 'development';

// Load only specific files based on stage
switch (stage) {
    case 'development':
        dotenvFlow.config({
            files: ['.env.development'],
            path: process.cwd()
        });
        break;
    case 'staging':
        dotenvFlow.config({
            files: ['.env.staging'],
            path: process.cwd()
        });
        break;
    case 'production':
        dotenvFlow.config({
            files: ['.env.production'],
            path: process.cwd()
        });
        break;
    default:
        throw new Error(`Invalid NODE_ENV: ${stage}`)
}

let config;

if (stage === "development") {
    config = require("./development").default
} else if (stage === "production") {
    config = require("./production").default
} else if (stage === "staging") {
    config = require("./staging").default
} else {
    throw new Error(`Invalid NODE_ENV: ${stage}`)
}

export default merge({
    stage
}, config)