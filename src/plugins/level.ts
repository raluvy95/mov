import { Message } from "eris";
import { client } from "../client/Client";
import { MovPlugin } from "../client/Plugin";
import { EMPTY_LEVEL } from "../constant/defaultConfig";
import type { ILevelDB, ISettingsDB } from "../interfaces/database";
import { formulaXP, sendLvlUP } from "../utils/levelUtils";

async function run(msg: Message<any>) {
    if (msg.author.bot) return;

    // Claim the XP slot before any awaits so duplicate/concurrent events do not
    // process the same user twice during the cooldown window.
    const user = msg.author.id;
    const now = Date.now();
    const cooldown = 60 * 1000;
    const lastXPAt = client.cooldownLevel.get(user);
    if (lastXPAt !== undefined && now < lastXPAt + cooldown) return;
    client.cooldownLevel.set(user, now);

    const lvl = await client.database.settings.get<ISettingsDB>(
        process.env.SERVER_ID!,
    )!;
    if (!lvl?.modules.level.enable) {
        client.cooldownLevel.delete(user);
        return;
    }

    if (lvl.modules.level.ignoreChannel?.includes(msg.channel.id)) {
        client.cooldownLevel.delete(user);
        return;
    }

    let level = await client.database.level.get<ILevelDB>(user);

    if (!level) {
        level = await client.database.level.set<ILevelDB>(
            user,
            EMPTY_LEVEL,
        );
    }

    const maxXP = lvl.modules.level.maxXP ?? 25;
    const minXP = lvl.modules.level.minXP ?? 15;
    const multiplyXP = lvl.modules.level.multiplyXP ?? 1;

    const addXP = Math.floor(Math.random() * (maxXP! - minXP! + 1)) + minXP;
    level.xp += addXP * multiplyXP;
    level.totalxp += addXP * multiplyXP;

    if (level.xp >= formulaXP(level.level)) {
        level.level++;
        level.xp = 0;
        await sendLvlUP(user, msg, level);
    }
    await client.database.level.set<ILevelDB>(user, level);
}

export default new MovPlugin("level", {
    event: "messageCreate",
    run,
});
