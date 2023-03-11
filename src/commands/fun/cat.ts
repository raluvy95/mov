import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import fetch from 'node-fetch'

function generator(msg: Message, args: string[]) {
    const err = "There's something went wrong with cat. No cat for you :("
    try {
        fetch("https://aws.random.cat/meow").then(async r => {
            try {
                const j = await r.json()
                client.createMessage(msg.channel.id, j.file)
            } catch {
                client.createMessage(msg.channel.id, err)
            }
        })

    } catch {
        client.createMessage(msg.channel.id, err)
        return
    }
}

class Cat extends MovCommand {
    constructor() {
        super("cat", generator, {
            aliases: ["kitty"],
            description: "kittee",
            usage: "eoijfvefr[ouher[ouewfoi"
        })
    }
}

export default new Cat()