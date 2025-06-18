import dotenv from 'dotenv'

dotenv.config()

const {
    USERS_SERVICE_DEV_DB,
    FOUNDERS_LIST_DEV_DB
} = process.env


console.log('Running in development mode')

export default {
    FOUNDERS_LIST_DB: FOUNDERS_LIST_DEV_DB!,
    USERS_SERVICE_DB:USERS_SERVICE_DEV_DB!
}