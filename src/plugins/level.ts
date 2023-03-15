import { Message, PossiblyUncachedTextable, TextableChannel } from "eris";
import { client, levelEmitter } from "../client/Client";
import { MovPlugin } from "../client/Plugin";
import { ILevelDB, ISettingsDB } from "../interfaces/database";
import { getUser } from "../utils/get";

const EMPTY_LEVEL = {
    xp: 0,
    level: 0,
    totalxp: 0
}


async function run(msg: Message<any>) {
    if (msg.author.bot) return;
    const lvl = await client.database.settings.get<ISettingsDB>(process.env.SERVER_ID!)!
    if (!lvl?.modules.level.enable) return

    let level = await client.database.level.get<ILevelDB>(msg.author.id)

    if (!level) {
        level = await client.database.level.set<ILevelDB>(msg.author.id, EMPTY_LEVEL)
    }

    // Level cooldown hander - 1 min
    if (!client.cooldownLevel.has(msg.author.id)) {
        client.cooldownLevel.set(msg.author.id, 0)
    }
    const now = Date.now();
    const ca = 60 * 1000;
    const user = msg.author.id;
    const et = client.cooldownLevel.get(user) as number + ca;
    if (now < et) return;
    client.cooldownLevel.set(user, now);
    setTimeout(() => {
        client.cooldownLevel.delete(user);
    }, ca);

    const maxXP = 25
    const minXP = 15
    const multiplyXP = 1

    const addXP = Math.floor(Math.random() * (maxXP! - minXP! + 1)) + minXP;
    level.xp += addXP * multiplyXP
    level.totalxp += addXP * multiplyXP

    // XP Formula for required Lvl
    const requiredLvl = 5 * (Math.pow(level.level, 2)) + (50 * level.level) + 100

    if (level.xp >= requiredLvl) {
        level.level++
        level.xp = 0

        if ('id' in msg.channel && typeof msg.channel.id == "string") {
            console.log(msg.channel)
            levelEmitter.emit('lvlUP', msg.channel.id, await getUser(msg.author.id), level.level)
        } else {
            throw new Error("Failed to submit level up greeting!")
        }
    }
    await client.database.level.set<ILevelDB>(msg.author.id, level)

}


export default new MovPlugin("level", {
    event: "messageCreate",
    run
})