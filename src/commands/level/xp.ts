import { Message, User } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import type { ILevelDB, IUserDB } from "../../interfaces/database";
import { getUser } from "../../utils/get";
import { legacyRank } from "../../utils/legacy";

async function useImage(user: User, level: ILevelDB, msg: Message) {
    let img;
    try {
        const { genXPRank } = await import("../../utils/canvas");
        img = await genXPRank(user, level);
    } catch (e) {
        console.error(e);
        await legacyRank(msg, level, user);
        return;
    }
    await client.createMessage(msg.channel.id, {}, [
        {
            file: img,
            name: "xp.png",
        },
    ]);
}

async function generator(msg: Message, args: string[]) {
    let user = msg.author;

    if (args.length > 0) {
        const u = await getUser(msg, args.join(" "));
        if (u !== undefined) {
            user = u;
        }
    }

    const level = await client.database.level.get<ILevelDB>(user.id);
    if (!level) {
        client.createMessage(
            msg.channel.id,
            "You don't have any XP. Try to chat first.",
        );
        return;
    }
    const legacy = await client.database.user.get<IUserDB>(user.id);
    if (legacy?.useLegacyRank) {
        await legacyRank(msg, level, user);
    } else await useImage(user, level, msg);
}

class XP extends MovCommand {
    constructor() {
        super("xp", generator, {
            aliases: ["rank", "level", "lvl"],
        });
    }
}

export default new XP();
