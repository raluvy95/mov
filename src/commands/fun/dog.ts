import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";

function generator(msg: Message, _args: string[]) {
    const err = "There's something went wrong with dog. No dog for you :(";
    try {
        fetch("https://dog.ceo/api/breeds/image/random").then(async (r) => {
            try {
                const j = await r.json() as { message: string };
                client.createMessage(msg.channel.id, j.message);
            } catch {
                client.createMessage(msg.channel.id, err);
            }
        });
    } catch {
        client.createMessage(msg.channel.id, err);
        return;
    }
}

class Dog extends MovCommand {
    constructor() {
        super("dog", generator, {
            aliases: ["puppy"],
            description: "doggieee",
        });
    }
}

export default new Dog();
