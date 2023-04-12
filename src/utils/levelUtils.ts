import { Message } from "eris"
import { client } from "../client/Client"
import { ILevelDB, ISettingsDB, IUserDB } from "../interfaces/database"
import { getMemberByID } from "./get"
import { probability } from "./math"

export function formulaXP(level: number) {
    return 5 * (Math.pow(level, 2)) + (50 * level) + 100
}

export async function sendLvlUP(user: string, msg: Message, level: ILevelDB) {
    if ('id' in msg.channel && typeof msg.channel.id == "string") {
        const userPref = await client.database.user.get<IUserDB>(user)
        const levelDB = (await client.database.settings.get<ISettingsDB>(process.env.SERVER_ID!))!

        let target = `<@${user}>`
        if (userPref?.noMentionOnLevelUP) {
            target = `**${msg.author.username}#${msg.author.discriminator}**`
        }

        const roleRewards = levelDB.modules.level.roleRewards

        if (roleRewards != undefined && roleRewards.length > 0) {
            const member = await getMemberByID(user)

            const itexist = roleRewards.filter(m => m.level == level?.level)
            if (itexist && itexist.length > 0) {
                for (const role of itexist) {
                    if (member.roles.findIndex(m => m == role.ID) != -1) continue;
                    await member.addRole(role.ID.toString(), `Role rewards - reached level ${level.level}`).catch(err => {
                        console.warn("Cannot added member's role due to\n", err)
                    })
                }
            }
        }

        const targetChannelID = levelDB.modules.level.lvlup?.channelId.toString()
        let targetMsg = (levelDB.modules.level.lvlup?.message || `Congrats {mention}! You reached level **{level}**!`)
            .replace("{mention}", target)
            .replace("{level}", level.level.toString())
        if (!userPref?.noMentionOnLevelUP && probability(30) && !levelDB.modules.level.noReminderToDisablePing) {
            targetMsg += '\n\nTired of getting pinged? Use `sudo uconf noMentionOnLevelUP true` and I won\'t ping you on level up!'
        }
        client.createMessage(targetChannelID == undefined || targetChannelID == "0" ? msg.channel.id : targetChannelID!, targetMsg)
            .catch(e => console.error("Failed to send lvl up message", e))
    } else {
        throw new Error("Failed to submit level up greeting!")
    }
}