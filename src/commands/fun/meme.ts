import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { pick } from "../../utils/math";
import { getSubreddit, parseToEmbed } from "../../utils/reddit";

async function generator(msg: Message, _args: string[]) {
    const subreddits = ["memes", "dankmemes", "meme", "okbuddyretard", "ComedyArchaeology"]
    const pickedSubreddit = pick(subreddits)
    const r = await getSubreddit(pickedSubreddit, {
        mediaOnly: true
    })

    const pickedContent = pick(r)
    client.createMessage(msg.channel.id, parseToEmbed(pickedContent).build())
}

class Meme extends MovCommand {
    constructor() {
        super("meme", generator, {
            aliases: ["memes", "funny"]
        })
    }
}

export default new Meme();