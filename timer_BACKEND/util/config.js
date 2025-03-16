import dotenv from 'dotenv'

//configurate envs here so we can use them in the whole project
dotenv.config()

export const SECRET = process.env.SECRET

export const MONGODB_URI = process.env.MONGODB_URI