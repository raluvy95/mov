import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";
import { DEFAULT_USER_SETTINGS } from "../../constant/defaultConfig";
import { IUserDB } from "../../interfaces/database";
import { checkURLValidity } from "../../utils/canvas";

async function generator(msg: Message, args: string[]) {
    let uSettings = await client.database.user.get<IUserDB>(msg.author.id)
    if (!uSettings) {
        uSettings = await client.database.user.set<IUserDB>(msg.author.id, DEFAULT_USER_SETTINGS)
    }
    if (args.length > 0) {
        const type = args[0]
        let value = args[1]
        if (!value) {
            client.createMessage(msg.channel.id, "Missing value")
            return
        }
        if (!Object.keys(uSettings).includes(type)) {
            client.createMessage(msg.channel.id, "Invalid type: " + type)
            return
        }
        switch (type) {
            case "customBackgroundURL":
                if (value != "color") {
                    let out = await checkURLValidity(value)
                    if (!out) {
                        client.createMessage(msg.channel.id, `Invalid URL.`)
                        return;
                    }
                }
                break
            case "useLegacyRank":
            case "noMentionOnLevelUP":
                if (!["true", "false"].includes(value.toLowerCase())) {
                    client.createMessage(msg.channel.id, `Type "true" or "false", not "${value.toLowerCase()}"`)
                    return
                }
                value = JSON.parse(value.toLowerCase())
                break
            case "aliases":
                client.createMessage(msg.channel.id, `Use \`${msg.prefix}aliases\` to manage your aliases!`)
                return
            case "prefix":
                value = value.replace(/"/g, '')
                if (value.length >= 32) {
                    client.createMessage(msg.channel.id, `Your prefix has reached the limit of character! (32 max)`)
                    return
                }
                break
        }
        client.database.user.set(`${msg.author.id}.${type}`, value)
        client.createMessage(msg.channel.id, `Successfully changed for your ${type}!`)
        return
    }
    const listAlias = uSettings.aliases.map(m => `**${m.commandTarget}** => (${m.alias.map(n => `\`${n}\``).join(", ")})`).join("\n")
    const e = new MovEmbed()
        .setTitle("User Settings")
        .setDesc(`Use \`${msg.prefix}help userconfig\` to check out how to edit and examples!`)
        .addField("Prefix [`prefix`]", uSettings.prefix || "No user prefix", true)
        .addField("Color Accent [`colorAccent`]", uSettings.colorAccent, true)
        .addField("No mention on level up message [`noMentionOnLevelUP`]", !uSettings.noMentionOnLevelUP ? "No" : "Yes", true)
        .addField("Use legacy rank [`useLegacyRank`]", !uSettings.useLegacyRank ? "No" : "Yes", true)
        .addField("Background URL [`customBackgroundURL`]", uSettings.customBackgroundURL != "color" ? `[click to view](${uSettings.customBackgroundURL})` : "color")
        .addField("Aliases", uSettings.aliases?.length > 0 ?
            listAlias.length >= 1000 ? listAlias.slice(0, 950) + "... `$aliases` to show more" : listAlias
            : "No user alias")
    client.createMessage(msg.channel.id, e.build())
}

class UserSettings extends MovCommand {
    constructor() {
        super("userconfig", generator, {
            aliases: ["uconfig", "uconf", "userconf", "usersettings", "usettings"],
            description: "User settings - configure user alias and preferencies\n" + `Change your user prefix or user alias!\nUse \`$userconfig <key> <value>\` (where key is in the \`code\` part) to change the configuration!\nUse \`$aliases\` to manage your aliases!\n\nExample:\n\`$uconf customBackgroundURL https://url/to/image.jpeg\`\n\`$uconf prefix \"hey mov, \"\`\n\`$uconf noMentionOnLevelUP true\``
        })
    }
}

export default new UserSettings();