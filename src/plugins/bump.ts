import { AdvancedMessageContent, Message } from "eris";
import { client } from "../client/Client";
import { MovPlugin } from "../client/Plugin";
import { EMPTY_LEVEL } from "../constant/defaultConfig";
import { ILevelDB, ISettingsDB } from "../interfaces/database";
import { formulaXP, sendLvlUP } from "../utils/levelUtils";

export default new MovPlugin("bump", {
    event: "messageCreate",
    async run(msg) {
        const serverPref = (await client.database.settings.get<ISettingsDB>(msg.guildID!))!
        if (serverPref.modules.bump.enable && msg.interaction?.name == "bump" && msg.author.id == "302050872383242240") {
            let target: string = ''
            let opt: AdvancedMessageContent = {}
            if (!serverPref.modules.bump.roleID || serverPref.modules.bump.roleID === "0") {
                target = msg.interaction.user.id
            } else {
                target = serverPref.modules.bump.roleID.toString()
                opt.allowedMentions = {
                    roles: [target]
                }
                target = "&" + target
            }
            let success = "Thank you for bumping this server!"
            if (serverPref.modules.bump.bumpRewards) {
                const level = await client.database.settings.get<ISettingsDB>(msg.guildID!)
                if (level?.modules.level.enable) {
                    const reward = 100 * level.modules.level.multiplyXP!

                    let lvl = await client.database.level.get<ILevelDB>(msg.interaction.user.id)

                    if (!lvl) {
                        lvl = await client.database.level.set<ILevelDB>(msg.interaction.user.id, EMPTY_LEVEL)
                    }
                    lvl.xp += reward
                    lvl.totalxp += reward
                    if (lvl.xp >= formulaXP(lvl.level)) {
                        lvl.level++
                        lvl.xp = 0
                        await sendLvlUP(msg.interaction.user.id, msg as Message<any>, lvl)
                    }
                    success += ` **You earn ${reward} XP!**`
                    await client.database.level.set(msg.interaction.user.id, lvl)
                }
            }
            success += "\nI will remind you to bump again in two hours!"
            client.createMessage(msg.channel.id, success)
            setTimeout(() => {
                client.createMessage(msg.channel.id, { content: `Hey <@${target}>, reminder to \`/bump\` again!`, ...opt })
            }, 10000)
        }
    }
})