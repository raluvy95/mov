import dotenv from 'dotenv';
import { CommandInteraction } from 'eris';
dotenv.config()
import { client } from './client/Client';
import { debug } from './utils/debug';
import { unlink } from 'fs';

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

client.on("interactionCreate", i => {
    if (i.type == 2) {
        const data = i as CommandInteraction
        if (data.data.name.startsWith("jolly")) {
            i.createMessage("Slash command is not supported, use traditional command instead.")
        }
    }
})


unlink("generated.png", () => { })
unlink("input.png", () => { })

client.connect()