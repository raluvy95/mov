import { Message } from "eris";
import { client } from "../client/Client";
import { ILevelDB, ISettingsDB, IUserDB } from "../interfaces/database";
import { getMemberByID, parseName } from "./get";
import { probability } from "./math";

export function formulaXP(level: number) {
    return 5 * Math.pow(level, 2) + 50 * level + 100;
}

export async function sendLvlUP(user: string, msg: Message, level: ILevelDB) {
    if ("id" in msg.channel && typeof msg.channel.id === "string") {
        const userPref = await client.database.user.get<IUserDB>(user);
        const levelDB = (await client.database.settings.get<ISettingsDB>(
            process.env.SERVER_ID!,
        ))!;

        const roleRewardsReceived: string[] = [];

        let target = `<@${user}>`;
        if (userPref?.noMentionOnLevelUP) {
            target = `**${parseName(msg.author)}**`;
        }

        const roleRewards = levelDB.modules.level.roleRewards;

        if (roleRewards !== undefined && roleRewards.length > 0) {
            const member = await getMemberByID(user);

            const itexist = roleRewards.filter((m) => m.level <= level?.level);
            if (itexist && itexist.length > 0) {
                for (const role of itexist) {
                    if (member.roles.findIndex((m) => m === role.ID) !== -1)
                        continue;
                    await member
                        .addRole(
                            role.ID.toString(),
                            `Role rewards - reached level ${level.level}`,
                        )
                        .catch((err) => {
                            console.warn(
                                "Cannot added member's role due to\n",
                                err,
                            );
                        });
                    roleRewardsReceived.push(role.ID)
                }
            }
        }

        const targetChannelID =
            levelDB.modules.level.lvlup?.channelId.toString();
        let targetMsg = (
            levelDB.modules.level.lvlup?.message ||
            "Congrats {mention}! You reached level **{level}**!"
        )
            .replace("{mention}", target)
            .replace("{level}", level.level.toString());
        if (
            !userPref?.noMentionOnLevelUP &&
            probability(30) &&
            !levelDB.modules.level.noReminderToDisablePing
        ) {
            targetMsg +=
                "\n\nTired of getting pinged? Use `sudo uconf noMentionOnLevelUP true` and I won't ping you on level up!";
        }
        if (roleRewardsReceived.length > 0) {
            if (targetChannelID === undefined || targetChannelID === "0"
                ? msg.channel.id
                : targetChannelID! === msg.channel.id) {
                targetMsg += `\nYou earned ${roleRewardsReceived.map(m => `<@&${m}>`).join(", ")}!`
            } else {
                client.createMessage(msg.channel.id, { content: `**Congratulations!** You earned ${roleRewardsReceived.map(m => `<@&${m}>`).join(", ")} for reaching level ${level.level}!`, allowedMentions: { users: true, roles: false } })
            }
        }
        client
            .createMessage(
                targetChannelID === undefined || targetChannelID === "0"
                    ? msg.channel.id
                    : targetChannelID!,
                {
                    content: targetMsg,
                    allowedMentions: { users: true, roles: false }
                },
            )
            .catch((e) => console.error("Failed to send lvl up message", e));
    } else {
        throw new Error("Failed to submit level up greeting!");
    }
}
