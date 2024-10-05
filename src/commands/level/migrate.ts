import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { ILevelDB } from "../../interfaces/database";

async function generator(msg: Message, args: string[]) {
    const userId = args[0];
    const xp = args[1];
    const totalXP = args[2];
    const level = args[3];
    if (!userId || !xp || !totalXP || !level) {
        client.createMessage(
            msg.channel.id,
            `Usage: \`${msg.prefix}migrate <userid> <xp> <totalXP> <level>\``,
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
        totalxp: Number(totalXP),
    });
    client.createMessage(
        msg.channel.id,
        `Successfully set for \`${userId}\`'s level and xp`,
    );
    return;
}

class Migrate extends MovCommand {
    constructor() {
        super("migrate", generator, {
            description: "Same thing as adduserlb, but with totalxp as an argument.",
            requirements: {
                userIDs: process.env.OWNER_ID!.split(" ")
            }
        })
    }
}

export default new Migrate();