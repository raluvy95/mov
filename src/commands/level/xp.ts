import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { ILevelDB } from "../../interfaces/database";
import { genXPRank } from "../../utils/canvas";

async function generator(msg: Message, _args: string[]) {
    const level = await client.database.level.get<ILevelDB>(msg.author.id)
    if (!level) {
        client.createMessage(msg.channel.id, "You don't have any XP. Try to chat first.")
        return
    }
    const img = await genXPRank(msg.author, level)
    client.createMessage(msg.channel.id, {}, [{
        file: img,
        name: "xp.png"
    }])
}

class XP extends MovCommand {
    constructor() {
        super("xp", generator, {
            aliases: ["rank", "level", "lvl"],
        })
    }
}

export default new XP();