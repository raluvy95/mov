import dotenv from 'dotenv';
dotenv.config()
import { client } from './client/Client';
import { lavalink } from './client/Lavalink';
import { debug } from './utils/debug';

process.on("unhandledRejection", (rej) => {
    console.error(rej);
})

process.on("uncaughtException", (rej) => {
    console.error(rej)
})

client.on("error", (e) => {
    console.error(e)
})

client.on("debug", (i) => {
    debug(i)
})

lavalink.on("error", (_: string, e: Error) => {
    console.error(e)
})

client.connect()