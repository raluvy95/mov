import { client } from "../client/Client";
import { MovPlugin } from "../client/Plugin";
import { ISettingsDB } from "../interfaces/database";

export default new MovPlugin("automessageforum", {
    event: "threadCreate",
    async run(c) {
        // to prevent from sending twice (eris moment)
        if (!c.parentID || c.lastMessageID !== null) return;

        const conf = await client.database.settings.get<ISettingsDB>(
            c.guild.id,
        );
        if (!conf?.modules.autoMessageForum?.enable) return;
        const autoForum = conf?.modules.autoMessageForum!;

        const parent = client.getChannel(c.parentID);
        // actual forum and not just thread
        if (
            (parent.type as 15) === 15 &&
            !autoForum.ignoreChannel?.includes(parent.id)
        ) {
            const ment = autoForum.mentionable;
            client.createMessage(c.id, {
                content: autoForum.message!,
                allowedMentions: { roles: ment, everyone: false },
            });
        }
    },
});
