import { FileContent, MessageContent } from "eris";
import { client } from "../client/Client";
import { MovEmbed } from "../client/Embed";
import { MovPlugin } from "../client/Plugin";
import { ISettingsDB } from "../interfaces/database";

export default new MovPlugin("messageReference", {
    event: "messageCreate",
    async run(msg) {
        const matched = msg.content.match(
            /http(s)?:\/\/discord.com\/channels\/[0-9]{17,}\/[0-9]{17,}\/[0-9]{17,}/,
        );
        if (!matched) return;

        const enable = await client.database.settings.get<ISettingsDB>(
            msg.guildID!,
        );
        if (enable?.modules.messageReference.enable) {
            const link = matched[0];
            const [_, channelId, messageId] = link.split("/").slice(-3);
            try {
                let result: MessageContent = {};
                let file: FileContent[] = [];
                const msgRef = await client.getMessage(channelId, messageId);
                if ("nsfw" in msgRef.channel) {
                    if (msgRef.channel.nsfw) return;
                    if (
                        !msgRef.channel.permissionsOf(msg.author.id).json
                            .readMessages
                    )
                        return;
                }
                const e = new MovEmbed()
                    .setFooter(msgRef.author.username, msgRef.author.avatarURL)
                    .setTitle("Message Reference (click to jump)")
                    .setURL(matched[0])
                    .setTimestamp(new Date(msgRef.timestamp));
                if (msgRef.content.length > 0) {
                    e.setDesc(msgRef.content);
                }
                result = {
                    embeds: e.return(),
                };
                if (msgRef.attachments.length > 0) {
                    file = [];
                    for (const a of msgRef.attachments) {
                        file.push({
                            name: a.filename,
                            file: URL.createObjectURL(await fetch(a.url).then((r) => r.blob())),
                        });
                    }
                }
                if (msgRef.embeds.length > 0) {
                    for (const em of msgRef.embeds) {
                        result.embeds?.push(em);
                    }
                    result.embeds?.slice(0, 9);
                }
                client.createMessage(msg.channel.id, result, file);
            } catch {
                return;
            }
        }
    },
});
