import { Message } from "eris";
import { isIPv4 } from "net";
import fetch from "node-fetch";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";

async function generator(msg: Message, args: string[]) {
    if (!args[0]) {
        client.createMessage(msg.channel.id, "Give me the IPv4.")
        return
    }
    if (!isIPv4(args[0])) {
        client.createMessage(msg.channel.id, "That's not an IPv4")
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
            description: "Get information from specific IPv4",
            cooldown: 5 * 1000
        })
    }
}

export default new IP();