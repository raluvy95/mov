import { Message } from "eris"
import { client } from "../client/Client"
import { ILevelDB, ISettingsDB, IUserDB } from "../interfaces/database"
import { getMemberByID } from "./get"

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
        const targetMsg = levelDB.modules.level.lvlup?.message || `Congrats {mention}! You reached level **{level}**!`
        client.createMessage(targetChannelID == undefined || targetChannelID == "0" ? msg.channel.id : targetChannelID!,
            targetMsg.replace("{mention}", target)
                .replace("{level}", level.level.toString())).catch(e => console.error("Failed to send lvl up message", e))
    } else {
        throw new Error("Failed to submit level up greeting!")
    }
}