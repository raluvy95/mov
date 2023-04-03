import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import fetch from 'node-fetch'

function generator(msg: Message, _args: string[]) {
    const err = "There's something went wrong with cat. No cat for you :("

    fetch("https://cataas.com/cat").then(async r => {
        try {
            const j = await r.buffer()
            client.createMessage(msg.channel.id, {}, { file: j, name: "cat.png" })
        } catch {
            client.createMessage(msg.channel.id, err)
        }
    }).catch(e => {
        console.error(e)
        client.createMessage(msg.channel.id, err)
    })

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