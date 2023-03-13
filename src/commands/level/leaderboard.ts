import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";
import { leaderboardCanvas } from "../../utils/canvas";

async function generator(msg: Message, args: string[]) {
    if (!args[0]) {
        args[0] = "1"
    }
    if (isNaN(Number(args[0]))) {
        client.createMessage(msg.channel.id, "That's not an number")
        return
    }
    let page = Number(args[0])

    const all = (await client.database.level.all()).sort((a, b) => {
        return b.value.totalxp - a.value.totalxp
    })

    const filtered = all.slice(((page - 1) * 15), 15 * page)

    const maxPage = Number((all.length / 15).toFixed())

    if (page > maxPage) {
        page = maxPage
    }
    const img = await leaderboardCanvas(filtered, msg, page)
    const e = new MovEmbed()
        .setTitle("Leaderboard")
        .setImage("attachment://leaderboard.png")
        .setThumb(client.guilds.get(msg.guildID!)?.iconURL || client.user.staticAvatarURL)
        .setDesc(`Top **${all.length}** most active people of all time!\nType \`${msg.prefix}${msg.command?.label} <page>\` to the next page`)
        .setFooter(`Page ${page}/${maxPage}`, msg.author.avatarURL)

    client.createMessage(msg.channel.id, e.build(), {
        file: img,
        name: "leaderboard.png"
    })
}

class Leaderboard extends MovCommand {
    constructor() {
        super("leaderboard", generator, {
            aliases: ["lb", "levels", "ranks", "lboard"]
        })
    }
}

export default new Leaderboard();