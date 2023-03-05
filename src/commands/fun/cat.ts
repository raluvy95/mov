import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";

function generator(msg: Message, args: string[]) {
    client.createMessage(msg.channel.id, `Meow!!!! ${args.join(" ")}`)
}

class Cat extends MovCommand {
    constructor() {
        super("cat", generator, {
            aliases: ["kitty"],
            description: "kittee",
            usage: "eoijfvefr[ouher[ouewfoi"
        })
    }
}

export default new Cat()