import { Message } from "eris";
import { inspect } from "util";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";

function generator(message: Message, args: string[]) {
    const clean = (text: string | any) => {
        if (typeof text === "string")
            return text
                .replace(/`/g, "`" + String.fromCharCode(8203))
                .replace(/@/g, "@" + String.fromCharCode(8203));
        else return text;
    };

    function codee(text: string): string {
        return "```ts\n" + text + "\n```"
    }
    try {
        const code = args.join(" ");
        let evaled = eval(code);
        if (typeof evaled !== "string") {
            evaled = inspect(evaled);
        }
        const output = clean(evaled as string)
        if (output.length > 1990) {
            client.createMessage(message.channel.id, "The output is too long! Check logs!")
            console.log(output)
            return
        } else {
            client.createMessage(message.channel.id, codee(String(output)))
        }
    } catch (err: any) {
        client.createMessage(message.channel.id, codee(String(!err.stack ? err : err.stack.replace(/\((.*)\)/g, ''))))
    }
}

class Eval extends MovCommand {
    constructor() {
        if (!process.env.OWNER_ID) throw new Error("The env OWNER_ID is undefined")
        super("eval", generator, {
            hidden: true,
            requirements: {
                userIDs: process.env.OWNER_ID.split(" ")
            }
        })
    }
}

export default new Eval();