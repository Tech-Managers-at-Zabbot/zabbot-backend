import dotenv from 'dotenv'

dotenv.config()

const {
    USERS_SERVICE_PRODUCTION_DB,
    USERS_SERVICE_DEV_DB,
    FOUNDERS_LIST_PRODUCTION_DB,
    FOUNDERS_LIST_DEV_DB
} = process.env

console.log('Running in production mode')

export default {
    FOUNDERS_LIST_DB: FOUNDERS_LIST_DEV_DB!,
    USERS_SERVICE_DB: USERS_SERVICE_DEV_DB!
}