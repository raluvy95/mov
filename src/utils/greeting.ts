import { Guild, Member, MemberPartial } from "eris";
import { client } from "../client/Client";
import { ISettingsDB } from "../interfaces/database";
import { parseName } from "./get";

export async function greeting(
    type: "w" | "g",
    guild: Guild,
    member: Member | MemberPartial,
) {
    // rome-ignore lint/suspicious/noDoubleEquals: <explanation>
    if (guild.id != process.env.SERVER_ID!) return;

    const greeting = await client.database.settings.get<ISettingsDB>(guild.id);
    if (!greeting) return;
    const w =
        type === "w" ? greeting.modules.welcome : greeting.modules.goodbye;

    if (!w.enable) return;

    if (member.user.bot && w.ignoreBot) return;

    const channelId = w.channelId;
    const channel = guild.channels.find((m) => m.id === channelId?.toString());
    if (!channel) {
        console.warn("Cannot find a channel to send.");
        return;
    }

    let content = !w.message
        ? "Hello {mention} and welcome to the server! We now have {memberCount}!"
        : w.message
            .replace("{server}", guild.name)
            .replace("{memberCount}", guild.memberCount.toString())
            .replace(
                "{name}",
                parseName(member.user),
            )
            .replace(
                "{user}",
                parseName(member.user),
            );

    if (type === "w") {
        content = content.replace("{mention}", `<@${member.id}>`);
    }
    client.createMessage(channel.id, content);
}
