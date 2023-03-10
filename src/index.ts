import dotenv from 'dotenv';
dotenv.config()
import { client } from './client/Client';

process.on("unhandledRejection", (rej) => {
    console.error(rej)
})

process.on("uncaughtException", (rej) => {
    console.error(rej)
})

client.connect()