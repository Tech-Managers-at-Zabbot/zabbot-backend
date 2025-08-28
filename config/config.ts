import merge from 'lodash.merge';
import dotenvFlow from 'dotenv-flow';
import fs from 'fs';

const stage = process.env.NODE_ENV || 'development';

if (stage === 'development') {
    dotenvFlow.config({
        files: ['.env.development'],
        path: process.cwd()
    });
} else if (stage === 'production') {
    if (fs.existsSync('../.env.production')) {
        dotenvFlow.config({
            files: ['.env.production'],
            path: process.cwd()
        });
    }else {
        dotenvFlow.config({
            files: ['.env'],
            path: process.cwd()
        });
    }
}else if(stage === 'dev:start'){
     if (fs.existsSync('../.env.development')) {
        dotenvFlow.config({
            files: ['.env.development'],
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
} else if (stage === 'dev:start') {
    config = require("./dev:start").default
} else {
    throw new Error(`Invalid NODE_ENV: ${stage}`)
}

export default merge({
    stage
}, config)