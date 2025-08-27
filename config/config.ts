import merge from 'lodash.merge';
import dotenvFlow from 'dotenv-flow';
import fs from 'fs';

const stage = process.env.NODE_ENV || 'development';

if (stage === 'development') {
    dotenvFlow.config({
        files: ['.env.development'],
        path: process.cwd()
    });
} else if (stage === 'staging') {
    const envFile = '.env.staging';
       if (fs.existsSync(envFile)) {
        dotenvFlow.config({
            files: [envFile],
            path: process.cwd()
        });
    } else {
        dotenvFlow.config({
            files: ['.env'],
            path: process.cwd()
        });
    }
} else if (stage === 'production') {
    const envFile = '.env.production';
    if (fs.existsSync(envFile)) {
        dotenvFlow.config({
            files: [envFile],
            path: process.cwd()
        });
    }else {
        dotenvFlow.config({
            files: ['.env'],
            path: process.cwd()
        });
    }
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