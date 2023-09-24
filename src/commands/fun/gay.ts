import { Message, User } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";
import { getUser } from "../../utils/get";

async function generator(msg: Message, args: string[]) {
    let author: User | undefined = msg.author;

    if (args.length !== 0) {
        author = await getUser(msg, args.join(" "));
        if (!author) {
            author = msg.author;
        }
    }

    const gay_percent = Math.floor(
        Math.random() * 101,
    )

    let gay_msg = "Not really gay."

    switch (Math.floor(gay_percent / 10)) {
        case 1:
            gay_msg = "Not gay."
            break
        case 2:
            gay_msg = "I can tell you are not really gay."
            break
        case 3:
            gay_msg = "People think you're gay, but you aren't (yet) :)"
            break
        case 4:
            gay_msg = "You used to act gay on purpose."
            break
        case 5:
            gay_msg = "I can tell you act gay unironically, don't you?"
            break
        case 6:
            gay_msg = "You may like men... ironically."
            break
        case 7:
            gay_msg = "Not enough to love other men"
            break
        case 8:
            gay_msg = "Almost there :)"
            break
        case 9:
            gay_msg = "Allmmooossttt theeerreee :D"
            break
        case 10:
            gay_msg = "Real gay"
            break
    }

    const e = new MovEmbed()
        .setTimestamp(undefined)
        .setDesc(
            `${author.username} is **${gay_percent}%** gay! 🏳️‍🌈`,
        )
        .setFooter(gay_msg)
        .build();
    client.createMessage(msg.channel.id, e);
}

class Gay extends MovCommand {
    constructor() {
        super("gay", generator, {
            aliases: ["homo", "homosexual"],
        });
    }
}

export default new Gay();
