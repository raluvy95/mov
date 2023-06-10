import { Message } from "eris";
import { client } from "../client/Client";
import { MovPlugin } from "../client/Plugin";
import { EMPTY_LEVEL } from "../constant/defaultConfig";
import { ILevelDB, ISettingsDB } from "../interfaces/database";
import { formulaXP, sendLvlUP } from "../utils/levelUtils";

async function run(msg: Message<any>) {
    if (msg.author.bot) return;
    const lvl = await client.database.settings.get<ISettingsDB>(
        process.env.SERVER_ID!,
    )!;
    if (!lvl?.modules.level.enable) return;

    if (lvl.modules.level.ignoreChannel?.includes(msg.channel.id)) return;

    let level = await client.database.level.get<ILevelDB>(msg.author.id);

    if (!level) {
        level = await client.database.level.set<ILevelDB>(
            msg.author.id,
            EMPTY_LEVEL,
        );
    }

    // Level cooldown hander - 1 min
    if (!client.cooldownLevel.has(msg.author.id)) {
        client.cooldownLevel.set(msg.author.id, 0);
    }
    const now = Date.now();
    const ca = 60 * 1000;
    const user = msg.author.id;
    const et = (client.cooldownLevel.get(user) as number) + ca;
    if (now < et) return;
    client.cooldownLevel.set(user, now);
    setTimeout(() => {
        client.cooldownLevel.delete(user);
    }, ca);

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
    await client.database.level.set<ILevelDB>(msg.author.id, level);
}

export default new MovPlugin("level", {
    event: "messageCreate",
    run,
});
