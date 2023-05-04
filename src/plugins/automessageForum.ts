import { client } from "../client/Client";
import { MovPlugin } from "../client/Plugin";
import { ISettingsDB } from "../interfaces/database";

export default new MovPlugin("automessageforum", {
    event: "threadCreate",
    async run(c) {
        // to prevent from sending twice (eris moment)
        if (!c.parentID || c.lastMessageID !== null) return;

        const conf = await client.database.settings.get<ISettingsDB>(c.guild.id)
        if (!conf?.modules.autoMessageForum?.enable) return;

        // actual forum and not just thread
        if ((client.getChannel(c.parentID).type as 15) == 15) {
            const ment = conf.modules.autoMessageForum.mentionable
            client.createMessage(c.id, { content: conf.modules.autoMessageForum.message!, allowedMentions: { roles: ment, everyone: false } })
        }
    }
})