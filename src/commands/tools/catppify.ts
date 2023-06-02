import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { Noise, Palette, catppify } from "../../utils/catppify";
import { DateTime } from "luxon";
import ms from "ms";

async function generator(msg: Message, args: string[]) {
    let ext = !args[0] ? '' : args[0].split('.').at(-1)
    let link: string = ''
    let palette: string
    let noise: string


    if (args[0]?.startsWith("http://")) {
        client.createMessage(msg.channel.id, "HTTP is not supported. Use HTTPS instead!")
        return
    }

    if (!args[0]?.match('^https:\/\/') && !ext?.match(/(jp(e?)g|png|gif)/gi)) {
        if (msg.attachments.length < 1) {
            client.createMessage(msg.channel.id, "Invalid link")
            return
        }
        link = msg.attachments[0].url
        ext = link.split('.').at(-1)
        palette = args[0]
        noise = args[1]
    } else {
        link = args[0]
        palette = args[1]
        noise = args[2]
    }

    if (ext?.toLowerCase() == "webp") {
        client.createMessage(msg.channel.id, "Webp is not supported at this moment")
        return
    }

    if (!palette) {
        palette = 'mocha'
    } else {
        const avaliable_palette = ['frappe', 'latte', 'macchiato', 'mocha', 'oled']
        if (!avaliable_palette.includes(palette)) {
            client.createMessage(msg.channel.id, `Invalid palette. Use one of the following avaliable palettes: ${avaliable_palette.join(", ")}`)
            return
        }
    }
    if (!noise) {
        noise = '4'
    } else {
        if (isNaN(Number(noise))) {
            client.createMessage(msg.channel.id, `That's not a number lol`)
            return
        }
        const avaliable_noise = ['0', '1', '2', '3', '4', '5']
        if (!avaliable_noise.includes(noise)) {
            client.createMessage(msg.channel.id, `Invalid palette. Use one of the following avaliable noises: ${avaliable_noise.join(", ")}`)
            return
        }
    }
    const init_time = DateTime.now()

    await client.sendChannelTyping(msg.channel.id)

    const generated = await catppify(link, palette as Palette, noise as Noise)

    const final_time = DateTime.now()
    const diff = final_time.diff(init_time, ["hours", "minutes", "seconds", "milliseconds"])
    client.createMessage(msg.channel.id, `Here you go (Took ${ms(diff.toMillis())})`, {
        file: generated,
        name: "generated.png"
    })
}

class Catppify extends MovCommand {
    constructor() {
        super("catppify", generator, {
            description: "Generate your image based on Catppuccin theme!",
            usage: "<link or attachment> [palette] [noise]"
        })
    }
}

export default new Catppify();