import { Message } from "eris";
import { isIP } from "net";
import fetch from "node-fetch";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";

async function generator(msg: Message, args: string[]) {
    if (!args[0]) {
        client.createMessage(msg.channel.id, "Give me the IP.")
        return
    }
    if (isIP(args[0]) == 0) {
        client.createMessage(msg.channel.id, "That's not an IP")
        return
    }
    const jj = await fetch(`https://ipinfo.io/${encodeURIComponent(args[0])}/geo`)
    const info = await jj.json()
    const e = new MovEmbed()
        .setTitle(`IP: ${info.ip}`)
        .setDesc(`City: ${info.city}\nRegion: ${info.region}\nCountry: ${info.country}\nLocation: ${info.loc}\nTimezone: ${info.timezone}\nPostal: ${info.postal}`)
    client.createMessage(msg.channel.id, e.build())
}

class IP extends MovCommand {
    constructor() {
        super("ip", generator, {
            description: "Get information from specific IP",
            cooldown: 5 * 1000
        })
    }
}

export default new IP();