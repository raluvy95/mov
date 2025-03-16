import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";

function generator(msg: Message, args: string[]) {
    if (!args.length) {
        client.createMessage(msg.channel.id, "Where is my arguments??????????");
        return;
    }
    client
        .createMessage(
            msg.channel.id,
            `${args.join(" ")}\n *- ${msg.author.username}*`,
        )
        .catch(() => {
            client.createMessage(
                msg.channel.id,
                "There was an error. Try again",
            );
            return;
        });
}

class Echo extends MovCommand {
    constructor() {
        super("echo", generator, {
            description: "Sends back to your arguments",
        });
    }
}

export default new Echo();
