import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { urlToDataURI } from "../../utils/canvas";

export async function urlToBase64(url: string) {
    if (url.startsWith("data:image/")) {
        return url;
    }
    const buffer = await fetch(url).then((res) => res.arrayBuffer());
    const imageStr = Buffer.from(buffer).toString("base64");
    const type = url.substring(url.lastIndexOf(".") + 1);
    return `data:image/${type};base64,${imageStr}`;
}

async function generator(msg: Message, args: string[]) {
    function isEmote(a: string[]) {
        return a[0].startsWith("<a:") || a[0].startsWith("<:");
    }
    function isURL(a: string[]) {
        return a[0].startsWith("https://") || a[0].startsWith("http://");
    }
    if (!args[0]) {
        client.createMessage(
            msg.channel.id,
            `Please use \`${msg.prefix}addemoji <emoji or URL> <name if URL is input>\``,
        );
        return;
    }
    if (isEmote(args)) {
        let animated = false;
        if (args[0].startsWith("<a:")) animated = true;
        const emote = animated
            ? args[0].replace("<a:", "").replace(">", "")
            : args[0].replace("<:", "").replace(">", "");
        const [name, id] = emote.split(":");
        const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"
            }`;
        client
            .createGuildEmoji(msg.guildID!, {
                name: name,
                image: await urlToDataURI(url),
            })
            .then((e) => {
                client.createMessage(
                    msg.channel.id,
                    `I added <${e.animated ? "a" : ""}:${e.name}:${e.id
                    }> to this guild!`,
                );
            })
            .catch((e) =>
                client.createMessage(
                    msg.channel.id,
                    `I got an error!\n${e}`,
                ),
            );
    } else if (isURL(args)) {
        if (!args[1]) {
            client.createMessage(
                msg.channel.id,
                "Please tell what name is that. Unable to create new emoji without name",
            );
            return;
        }

        client
            .createGuildEmoji(msg.guildID!, {
                image: await urlToBase64(args[0]),
                name: args.slice(1).join("_"),
            })
            .then((e) => {
                client.createMessage(
                    msg.channel.id,
                    `I added <${e.animated ? "a" : ""}:${e.name}:${e.id
                    }> to this guild!`,
                );
            })
            .catch((e) =>
                client.createMessage(msg.channel.id, `I got an error!\n${e}`),
            );
    } else {
        client.createMessage(
            msg.channel.id,
            "It looks like your result is invalid",
        );
        return;
    }
}

class AddEmoji extends MovCommand {
    constructor() {
        super("addemoji", generator, {
            description: "Clone emoji to this server",
            usage: "<emoji or URL> <name if URL is input>",
            requirements: {
                permissions: {
                    manageEmojisAndStickers: true,
                },
            },
        });
    }
}

export default new AddEmoji();
