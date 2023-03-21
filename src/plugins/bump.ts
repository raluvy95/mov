import { MessageContent } from "eris";
import { client } from "../client/Client";
import { MovPlugin } from "../client/Plugin";
import { ISettingsDB } from "../interfaces/database";

export default new MovPlugin("bump", {
    event: "messageCreate",
    async run(msg) {
        const serverPref = (await client.database.settings.get<ISettingsDB>(msg.guildID!))!
        if (!serverPref.modules.bump.enable) return;
        if (msg.interaction?.name == "ping" && msg.author.id == "302050872383242240") {
            let target: string = ''
            let opt: MessageContent = {}
            if (!serverPref.modules.bump.roleID) {
                target = msg.interaction.user.id
            } else {
                target = serverPref.modules.bump.roleID.toString()
                opt = {
                    allowedMentions: {
                        roles: [target]
                    }
                }
                target = "&" + target
            }
            client.createMessage(msg.channel.id, { content: `Thank you <@${target}> for bumping this server!`, ...opt })
        }
    }
})