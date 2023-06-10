import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";

function generator(msg: Message, _args: string[]) {
    client.createMessage(msg.channel.id, "Pinging...").then(async (m) => {
        const diff = Date.now() - m.timestamp;
        await m.edit(
            `Pong! Discord API: \`${
                client.shards.get(0)?.latency === Infinity
                    ? "???"
                    : client.shards.get(0)?.latency
            }ms\` Actual Response: \`${diff}ms\``,
        );
    });
}

class Ping extends MovCommand {
    constructor() {
        super("ping", generator, {
            description: "Ping pong!",
            cooldown: 10 * 1000,
        });
    }
}

export default new Ping();
