import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { ILevelDB } from "../../interfaces/database";

async function generator(msg: Message, args: string[]) {
    const userId = args[0];
    const xp = args[1];
    const level = args[2];
    const totalXP = args[3]
    if (!userId || !xp || !level || !totalXP) {
        client.createMessage(
            msg.channel.id,
            `Usage: \`${msg.prefix}${msg.command?.label} <userid> <xp> <level> <totalXP>\``,
        );
        return;
    }
    if (await client.database.level.has(userId)) {
        client.database.level.set<ILevelDB>(userId, {
            xp: Number(xp),
            level: Number(level),
            totalxp: Number(totalXP),
        });
        client.createMessage(
            msg.channel.id,
            "That user is already exist, but I will overwrite it.",
        );
        return;
    }
    client.database.level.set<ILevelDB>(userId, {
        xp: Number(xp),
        level: Number(level),
        totalxp: Number(xp),
    });
    client.createMessage(
        msg.channel.id,
        `Successfully set for \`${userId}\`'s level and xp`,
    );
    return;
}

class AddUserLb extends MovCommand {
    constructor() {
        super("adduserlb", generator, {
            aliases: [
                "adduserleaderboard",
                "setuserlb",
                "adduserxp",
                "setuserleaderboard",
            ],
            usage: "<user id> <xp> <level>",
            requirements: {
                permissions: {
                    administrator: true,
                },
            },
        });
    }
}

export default new AddUserLb();
