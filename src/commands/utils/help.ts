import { Message } from "eris";
import { readdirSync } from "fs";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";

function generator(msg: Message, args: string[]) {
    const emb = new MovEmbed()

    if(args.length > 0) {
        const command = args[0]
        if(client.commands[command] == undefined) {
            
        }
    }
    emb.setTitle(`Help command - ${Object.keys(client.commands).length} commands`)
    .setThumb(client.user.avatarURL)
    let registeredCommand: string[] = []
    const modules = readdirSync("./build/commands")
    for (const mod of modules) {
        const commands = readdirSync(`./build/commands/${mod}`)
        for (const cmd of commands) {
            const command = cmd.split(".")[0]
            if(client.commands[command] != undefined) {
                registeredCommand.push(command)
            }
        }
        emb.addField(mod.toUpperCase(), registeredCommand.map(m => `\`${m}\``).join(", "))
        registeredCommand = []
    }

    client.createMessage(msg.channel.id, emb.build())
}

class Help extends MovCommand {
    constructor() {
        super("help", generator, {})
    }
}

export default new Help();