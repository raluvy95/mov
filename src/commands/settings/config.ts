import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";
import { ISettingsDB } from "../../interfaces/database";
import { Modules } from "../../interfaces/module";
import { dateToString } from "../../utils/dateToString";
import { getMember } from "../../utils/get";
import { EXAMPLE, VARIABLES } from "./.examples"

async function generator(msg: Message, args: string[]) {
    const settings = await client.database.settings.get<ISettingsDB>(msg.guildID!)
    const e = new MovEmbed()
    if (!settings) {
        // settings would never get null
        // since it is already setted after the bot has started and sees the guild for first time
        // in rare cases, database couldn't set default values and would result in null
        client.createMessage(msg.channel.id, "Rare error has occured.")
        return
    }

    if (args.length >= 1) {
        const modulee = args[0].toLowerCase()
        const subcommand = args[1]
        if (!subcommand) {
            if (modulee == "json") {
                client.createMessage(msg.channel.id, `\`\`\`json\n${JSON.stringify(settings.modules, null, 4)}\n\`\`\``)
                return
            } else if (!settings.modules[modulee as keyof Modules]) {
                client.createMessage(msg.channel.id, `Cannot find module \`${modulee}\``)
                return
            } else {
                const modul = settings.modules[modulee as keyof Modules]
                e.setTitle(`View detailed for ${modulee} in JSON`)
                    .setDesc(`\`\`\`json\n${JSON.stringify(modul, null, 4)}\n\`\`\``)
                    .addField("How to set the values?", `Use ${msg.prefix}conf ${modulee} set <key> <value>\nTo change prefix for this bot, please use \`${msg.prefix}prefix <value>\`\n\nYou can also use \`add\` or \`remove\` subcommand to add new value if key's type is [an array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) (doesn't support multiple key sadly)`)
                    .addField("Example arguments", EXAMPLE[modulee as keyof Modules].split("\n").map(m => `\`${m.length < 1 ? "set enable false" : m}\``).join("\n"))
                    .addField("Variables", VARIABLES[modulee as keyof Modules].length < 1 ? "No variables" : VARIABLES[modulee as keyof Modules])
                client.createMessage(msg.channel.id, e.build())
                return
            }
        }
        const key = args[2]
        const value = args.slice(3).join(" ")
        if (!key) {
            client.createMessage(msg.channel.id, "What key do you want to change to?")
            return
        } else if (!value) {
            client.createMessage(msg.channel.id, "What value for key do you want to change?")
            return
        }
        switch (subcommand.toLowerCase()) {
            case 'add':
                if (!Array.isArray((settings.modules[modulee as keyof Modules] as any)[key])) {
                    client.createMessage(msg.channel.id, "The key you're looking for is not an array!")
                    return
                }
                try {
                    (settings.modules[modulee as keyof Modules] as any)[key].push(JSON.parse(value))
                    await client.database.settings.set<ISettingsDB>(msg.guildID!, settings)
                    client.createMessage(msg.channel.id, `Successfully set!`)
                } catch (e) {
                    client.createMessage(msg.channel.id, `There's something went wrong: ${e}`)
                    return
                }
                break
            case 'remove':
                if (!Array.isArray((settings.modules[modulee as keyof Modules] as any)[key])) {
                    client.createMessage(msg.channel.id, "The key you're looking for is not an array!")
                    return
                }
                try {
                    (settings.modules[modulee as keyof Modules] as any)[key].splice((settings.modules[modulee as keyof Modules] as any)[key].indexOf(JSON.parse(value)), 1)
                    await client.database.settings.set<ISettingsDB>(msg.guildID!, settings)
                    client.createMessage(msg.channel.id, `Successfully set!`)
                } catch (e) {
                    client.createMessage(msg.channel.id, `There's something went wrong: ${e}`)
                    return
                }
                break
            case 'set':
                try {
                    try {
                        await client.database.settings.set<ISettingsDB>(`${msg.guildID!}.modules.${modulee}.${key}`, JSON.parse(value))
                    } catch {
                        await client.database.settings.set<ISettingsDB>(`${msg.guildID!}.modules.${modulee}.${key}`, value)
                    }
                    client.createMessage(msg.channel.id, `Successfully set!`)
                } catch (e) {
                    client.createMessage(msg.channel.id, `There's something went wrong: ${e}`)
                    return
                }
                break
            default:
                client.createMessage(msg.channel.id, `Invalid subcommand.`)
                return
        }
    } else {
        const botAsMember = await getMember(client.user.id)
        e.setTitle("Bot Settings")
            .setDesc(`The prefix is \`${settings.prefix}\`. Added on ${dateToString(new Date(botAsMember!.joinedAt!))}\n\nView the detailed module using \`${settings.prefix}config <module>\``)
        for (const [k, v] of Object.entries(settings.modules)) {
            e.addField(`${k.toUpperCase()} [\`${k}\`]`, v.enable ? "Enabled" : "Disabled", true)
        }
        client.createMessage(msg.channel.id, e.build())
    }
}

class Config extends MovCommand {
    constructor() {
        super("config", generator, {
            aliases: ["settings", "conf"],
            requirements: {
                permissions: {
                    administrator: true
                }
            }
        })
    }
}

export default new Config();