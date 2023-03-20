import { Message } from "eris";
import { readdirSync } from "fs";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";

async function generator(msg: Message, args: string[]) {
    const emb = new MovEmbed()

    if (args.length > 0) {
        const command = client.resolveCommand(args[0])
        if (command != undefined) {
            function bool(bo: boolean) {
                return bo ? "Yes" : "No"
            }
            const prefixes = client.guildPrefixes[msg.guildID!] || "$"
            const prefix = Array.isArray(prefixes) ? prefixes[0] : prefixes
            const perm = () => {
                if (!command.requirements.permissions || Object.keys(command.requirements.permissions).length < 1) return "No permissions is required"
                let result: string = ''
                for (const [k, v] of Object.entries(command.requirements.permissions)) {
                    result += `**${k}** - ${v ? '✅' : '❌'}`
                }
                return result
            }
            const usagestat = await client.database.cmdStat.get<number>(command.label)
            emb.setTitle(`Command: ${command.label}`)
                .setDesc(command.description)
                .addFields([
                    { name: "Aliases", value: command.aliases.length < 1 ? "No aliases" : command.aliases.map(m => `\`${m}\``).join(", "), inline: true },
                    { name: "Cooldown", value: (command.cooldown / 1000).toString() + "s", inline: true },
                    { name: "Usage", value: `${prefix}${command.label} ${command.usage}`, inline: true },
                    { name: "DM only", value: bool(command.dmOnly), inline: true },
                    { name: "Server only", value: bool(command.guildOnly), inline: true },
                    { name: "Usage count", value: !usagestat ? "Nobody uses that :(" : usagestat.toString(), inline: true },
                    { name: "Permission", value: perm() }
                ])
            client.createMessage(msg.channel.id, emb.build())
            return
        } else if (args[0] == "--show") {

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
            if (client.commands[command] != undefined) {
                const c = client.commands[command]
                if (c.hidden) continue;
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
        super("help", generator, {
            description: "Help command",
            usage: "[command name]",
            cooldown: 5 * 1000
        })
    }
}

export default new Help();