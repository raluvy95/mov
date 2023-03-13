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
    let img
    try {
        img = await genXPRank(msg.author, level)
    } catch {
        client.createMessage(msg.channel.id, `There was an error rendering the rank image. (most likely invalid user config)\nYou currently have level **${level.level}**, xp **${level.xp}** and total xp: **${level.totalxp}**`)
        return
    }
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