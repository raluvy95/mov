import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { ILevelDB } from "../../interfaces/database";

async function generator(msg: Message, args: string[]) {
    const userId = args[0]
    const xp = args[1]
    const level = args[2]
    if (!userId || !xp || !level) {
        client.createMessage(msg.channel.id, `Usage: \`${msg.prefix}${msg.command} <userid> <xp> <level>\``)
        return
    }
    if (await client.database.level.has(userId)) {
        client.createMessage(msg.channel.id, "That user is already existed. Maybe try to remove and add again?")
        return
    }
    client.database.level.set<ILevelDB>(userId, {
        xp,
        level,
        totalxp: xp
    })
    client.createMessage(msg.channel.id, `Successfully set for \`${userId}\`'s level and xp`)
    return
}

class AddUserLb extends MovCommand {
    constructor() {
        super("adduserlb", generator, {
            aliases: ["adduserleaderboard"],
            usage: "<user id> <xp> <level>",
            requirements: {
                permissions: {
                    administrator: true
                }
            }
        })
    }
}

export default new AddUserLb();