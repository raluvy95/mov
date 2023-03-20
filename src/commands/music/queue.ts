import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";

function generator(msg: Message, _args: string[]) {
    const values = client.queue.values()
    const e = new MovEmbed()
        .setTitle("Queues")
    let index: number = 1
    for (const v of values) {
        e.addField(`${index} - ${v.info.title}`,
            `Author: ${v.info.author}`)
        index++
    }
    client.createMessage(msg.channel.id, e.build())
}

class Queue extends MovCommand {
    constructor() {
        super("queue", generator, {})
    }
}

export default new Queue();