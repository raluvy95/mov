import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import fetch from 'node-fetch'
import { AbortSignal } from 'node-fetch/externals';

function generator(msg: Message, _args: string[]) {
    const err = "There's something went wrong with cat. No cat for you :("
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 10 * 1000);

        fetch("https://aws.random.cat/meow", {
            signal: controller.signal as AbortSignal
        }).then(async r => {
            try {
                const j = await r.json()
                client.createMessage(msg.channel.id, j.file)
            } catch {
                client.createMessage(msg.channel.id, err)
            }
        })
        clearTimeout(id);

    } catch {
        client.createMessage(msg.channel.id, err)
        return
    }
}

class Cat extends MovCommand {
    constructor() {
        super("cat", generator, {
            aliases: ["kitty"],
            description: "kittee (ignore what usage says lmao)",
            usage: "fwryeyyrjetehrgtcefrxaexfewstrhyeser4d"
        })
    }
}

export default new Cat()