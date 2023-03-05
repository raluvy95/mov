import dotenv from 'dotenv';
dotenv.config()
import { client } from './client/Client';

client.on("ready", () => {
    console.log(`Logged as ${client.user.username}#${client.user.discriminator}`)
})

process.on("unhandledRejection", (rej) => {
    console.error(rej)
})

process.on("uncaughtException", (rej) => {
    console.error(rej)
})

client.connect()