import dotenv from 'dotenv';
dotenv.config()
import { client } from './client/Client';
import { debug } from './utils/debug';

process.on("unhandledRejection", (rej) => {
    console.error(rej)
})

process.on("uncaughtException", (rej) => {
    console.error(rej)
})

client.on("error", (e) => {
    console.error(e)
})

client.on("debug", debug)

client.connect()