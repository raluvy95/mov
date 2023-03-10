import { labels } from "@catppuccin/palette";
import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";
import { IUserDB } from "../../interfaces/database";

async function generator(msg: Message, args: string[]) {
    let uSettings = await client.database.user.get<IUserDB>(msg.author.id)
    if (!uSettings) {
        uSettings = await client.database.user.set<IUserDB>(msg.author.id, {
            prefix: "$",
            rankLayout: "mov",
            aliases: [],
            colorAccent: labels.mauve.mocha.hex,
            customBackgroundURL: undefined
        })
    }
    // to prevent from adding useralias to existing aliases smh
    const allCommandsNameAndAliases = Object.values(client.commands)
        .flatMap(m => m.aliases)
        .concat(
            Object.keys(client.commands)
        )
        .concat(
            uSettings.aliases.flatMap(m => m.alias)
        )
    if (args.length < 1) {
        const e = new MovEmbed()
            .setTitle(`User aliases [${uSettings.aliases.length}]`)
            .setDesc(`If you want to modify your aliases, use \`$aliases add <alias name> <target>\` or \`$aliases remove <alias name>\`\nYou cannot have user alias if it conflicts with command name, its build-in aliases AND your user alias`)
        if (uSettings.aliases.length < 1) {
            e.addField("No aliases?", "you don't have any user aliases set")
        } else {
            for (const alias of uSettings.aliases.slice(0, 25)) {
                e.addField(`Target: ${alias.commandTarget}`, alias.alias.map(m => `\`${m}\``).join(", "))
            }
        }
        client.createMessage(msg.channel.id, e.build())
        return
    }
    const action = args[0]
    const name = args[1]
    const target = args[2]
    if (!name) {
        client.createMessage(msg.channel.id, "Missing alias name argument")
        return
    }
    switch (action.toLowerCase()) {
        case "add":
        case "create":
            if (allCommandsNameAndAliases.includes(name)) {
                client.createMessage(msg.channel.id, "Your alias is conflict with existing command name, alias or your other aliases. Please try a different one")
                return
            }
            if (!target) {
                client.createMessage(msg.channel.id, "What's that alias for? (Missing target command)")
                return
            }
            const cmd = client.resolveCommand(target)
            if (!cmd) {
                client.createMessage(msg.channel.id, "That target command is not found.")
                return
            }
            const existingCmd = uSettings.aliases.find(m => m.commandTarget == cmd.label)
            if (!existingCmd) {
                uSettings.aliases.push({
                    commandTarget: cmd.label,
                    alias: [name]
                })
            } else {
                existingCmd.alias.push(name)
                uSettings.aliases.splice(uSettings.aliases.findIndex(m => m.commandTarget == cmd.label), 1)
                uSettings.aliases.push(existingCmd)
            }
            client.createMessage(msg.channel.id, `Successfully added alias ${name}!`)
            break
        case "remove":
        case "rm":
            const existingAlias = uSettings.aliases.find(m => m.alias.includes(name))
            if (!existingAlias) {
                client.createMessage(msg.channel.id, "That alias doesn't exist. You probably already removed it")
                return
            }
            existingAlias.alias.splice(existingAlias.alias.findIndex(m => m == name), 1)
            uSettings.aliases.splice(uSettings.aliases.findIndex(m => m.commandTarget == existingAlias.commandTarget), 1)
            uSettings.aliases.push(existingAlias)
            break
        default:
            client.createMessage(msg.channel.id, "Invalid action")
            return
    }
    client.database.user.set(msg.author.id, uSettings)
}

class Aliases extends MovCommand {
    constructor() {
        super("aliases", generator, {
            aliases: ["alias"]
        })
    }
}

export default new Aliases();