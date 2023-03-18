import { sync } from "cross-spawn";
import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";

function asyncSafeExec(prompt: string[]) {
    return new Promise<string>((res, rej) => {
        const child = sync("./bin/qalc", prompt)
        if (child.error) {
            rej(child.error)
        } else if (child.status != 0) {
            rej(new Error(`Process exited with ${child.status}`))
        }
        let result: string = ''
        for (const o of child.output) {
            if (!(o instanceof Buffer)) continue
            result += o?.toString() + "\n"
        }
        res(result)
    })
}

async function generator(msg: Message, args: string[]) {
    if (args.length < 1) {
        client.createMessage(msg.channel.id, "Missing arguments")
        return
    }
    try {
        const result = await asyncSafeExec(args)
        console.log(result)
        const e = new MovEmbed()
            .setTitle("Calculator - Result")
            .setDesc(typeof result == "string" ? result : "No results")
            .setFooter(msg.author.username + "#" + msg.author.discriminator, msg.author.avatarURL)
        client.createMessage(msg.channel.id, e.build())
    } catch (e) {
        console.error(e)
        client.createMessage(msg.channel.id, "There was a problem with child process! Please try again later!")
        return
    }
}

class Qalculate extends MovCommand {
    constructor() {
        super("qalculate", generator, {
            aliases: ["qalc", "calc", "calculator", "qcalc"]
        })
    }
}

export default new Qalculate();