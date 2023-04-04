// There are legacy (aka no image in rank)

import { Message, User } from "eris";
import { client } from "../client/Client";
import { MovEmbed } from "../client/Embed";
import { ILevelDB, ISettingsDB } from "../interfaces/database";
import { getLeaderboardRank } from "./getLeaderboardRank";
import { formulaXP } from "./levelUtils";

function progressBar(currentXP: number, requiredXP: number): string {
    const fill = "🟩"
    const empty = "⬛"
    const fillN = Math.floor(currentXP / requiredXP * 10)
    const emptyN = 10 - fillN
    try {
        return fill.repeat(fillN) + empty.repeat(emptyN)
    } catch {
        return '???'
    }
}

export async function legacyRank(msg: Message<any>, rank: ILevelDB, user: User) {

    const reqXP = formulaXP(rank.level)
    const settingsDB = (await client.database.settings.get<ISettingsDB>(msg.guildID!))!
    const nextUp = settingsDB.modules!.level!.roleRewards?.find(m => rank.level < m.level)
    let nextUpStr: string;
    if (!nextUp) {
        nextUpStr = `There are no ranks upcoming :(`
    } else {
        const left = nextUp.level - rank.level
        nextUpStr = `**${left} level${left == 1 ? '' : 's'}** left to reach <@&${nextUp.ID}>!`
    }
    const XPleft = reqXP - rank.xp
    nextUpStr += `\n**${XPleft.toLocaleString()} XP** left to reach level ${rank.level + 1}!`
    const percent = Math.floor(rank.xp / reqXP * 100)
    const e = new MovEmbed()
        .setTitle("RANKS")
        .setThumb(user.avatarURL)
        .setDesc(nextUpStr)
        .addField("XP", rank.xp.toLocaleString(), true)
        .addField("Total XP", rank.totalxp.toLocaleString(), true)
        .addField("Level", String(rank.level), true)
        .addField("Progress Bar", `[${rank.xp.toLocaleString()}/${reqXP.toLocaleString()}] ${progressBar(rank.xp, reqXP)} (${percent}%)`)
        .setTimestamp(undefined)
    await client.createMessage(msg.channel.id, e.build())
    return
}

export async function legacyLeaderboard(levels: { id: string, value: ILevelDB }[], msg: Message<any>, page: number, maxPage: number) {

    const e = new MovEmbed()
        .setTitle("Leaderboard")
        .setThumb(client.guilds.get(msg.guildID!)?.iconURL || client.user.staticAvatarURL)
    let result = '';
    let position = (page == 0 ? page : page - 1) * 15;
    function award(position: number) {
        switch (position) {
            case 1:
                return '🥇'
            case 2:
                return '🥈'
            case 3:
                return '🥉'
            default:
                return position
        }
    }
    for (const l of levels) {
        position++
        result += `${award(position)} - <@${l.id}>\n**Level** ${l.value.level} | **Total XP** ${l.value.totalxp.toLocaleString()} | **XP** ${l.value.xp.toLocaleString()}\n`
    }
    let mesg: string;
    const currentRank = await getLeaderboardRank(msg.author.id)
    if (!currentRank.rank) {
        mesg = "You just ran this command"
    } else {
        mesg = `Rank: ${currentRank.rank} | **Level** ${currentRank.data.level}`
    }
    e.addField("Your rank", mesg)
        .setDesc(result)
        .setFooter(`Page ${page}/${maxPage}`)
    await client.createMessage(msg.channel.id, e.build())
}