import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";

function generator(msg: Message, _args: string[]) {
    if (client.queue.size < 1) {
        client.createMessage(msg.channel.id, "The queue is empty")
        return
    }
    const values = client.queue.values()
    const e = new MovEmbed()
        .setTitle("Queues")
    let index: number = 1
    const first = client.queue.first()
    for (const v of values) {
        e.addField(`${first?.track == v.track ? "▶" : index} - ${v.info.title}`,
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