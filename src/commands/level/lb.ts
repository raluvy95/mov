import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { leaderboardCanvas } from "../../utils/canvas";

async function generator(msg: Message, _args: string[]) {
    const all = (await client.database.level.all()).sort((a, b) => {
        return b.value.totalxp - a.value.totalxp
    }).slice(0, 15)

    const img = await leaderboardCanvas(all, msg)
    client.createMessage(msg.channel.id, `Top ${all.length > 15 ? 15 : all.length} most active people!`, {
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