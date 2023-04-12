import { Message, User } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";
import { getUser } from "../../utils/get";

async function generator(msg: Message, args: string[]) {

    let author: User | undefined = msg.author

    if (args.length != 0) {
        author = await getUser(msg, args.join(" "))
        if (!author) {
            author = msg.author
        }
    }

    const e = new MovEmbed()
        .setTimestamp(undefined)
        .setDesc(`${author.username} is **${Math.floor(Math.random() * 100)}%** gay! 🏳️‍🌈`)
        .build()
    client.createMessage(msg.channel.id, e)
}

class Gay extends MovCommand {
    constructor() {
        super("gay", generator, {
            aliases: ["homo", "homosexual"]
        })
    }
}

export default new Gay();