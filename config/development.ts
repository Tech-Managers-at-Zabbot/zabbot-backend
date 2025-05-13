import dotenv from 'dotenv'

dotenv.config()

const {
    DEV_DATABASE_URL
} = process.env

console.log('Running in development mode')

export default {
    DB_URL: DEV_DATABASE_URL
}