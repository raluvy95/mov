import { Message } from "eris";
import { MovCommand } from "../../client/Command";
import { summonWebhook } from "../../utils/summonWebhook";

async function generator(msg: Message, args: string[]) {
    const web = {
        avatarURL: msg.author.avatarURL,
        username: msg.author.username,
    };
    if (!args[0]) {
        await summonWebhook(msg.channel.id, {
            content: "I'm a bot now",
            ...web,
        });
        return;
    }
    await summonWebhook(msg.channel.id, { content: args.join(" "), ...web });
}

class Summon extends MovCommand {
    constructor() {
        super("summon", generator, {});
    }
}

export default new Summon();
