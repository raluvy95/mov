import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";

function generator(msg: Message, args: string[]) {
    client.createMessage(msg.channel.id, args.join(" "))
}

class Echo extends MovCommand {
    constructor() {
        super("echo", generator, {})
    }
}

export default new Echo();