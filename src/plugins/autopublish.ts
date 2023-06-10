import { client } from "../client/Client";
import { MovPlugin } from "../client/Plugin";
import { ISettingsDB } from "../interfaces/database";

export default new MovPlugin("AutoPublish", {
    event: "messageCreate",
    async run(msg) {
        // Check if the channel type is announcements
        if ("type" in msg.channel && msg.channel.type === 5) {
            const autopost = await client.database.settings.get<ISettingsDB>(
                msg.guildID!,
            );
            if (!autopost?.modules.autopublish.enable) return;
            await msg.crosspost();
        }
    },
});
