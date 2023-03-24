import Eris, { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";
import { asyncSafeExec } from "../../utils/asyncSafeExec";
import { dateToString } from "../../utils/dateToString";

function uptime() {
    const up = Math.floor(process.uptime()) * 1000
    function secondsToDhms(seconds: number): string {
        seconds = Number(seconds)
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);

        const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
        const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        return dDisplay + hDisplay + mDisplay + sDisplay;
    }
    return secondsToDhms(up / 1000)
}


function bytesToMB(bytes: number) {
    const mb = bytes / 1024 ** 2
    return mb.toFixed(0) + " MB"
}

async function generator(msg: Message, _args: string[]) {
    const shard_uptime = client.startTime
    const memoryUsage = process.memoryUsage()
    const typescript_version = await asyncSafeExec("npx", ["tsc", "-v"])
    let lastGitCommit: string = ''
    try {
        lastGitCommit = await asyncSafeExec("git", ["log", "--pretty=format:\"%h\"", "-1"])
    } catch {
        lastGitCommit = "No version was found"
    }
    const e = new MovEmbed()
        .setTitle("Bot info")
        .setDesc("A cool Discord bot")
        .addField("Library", `Eris v${Eris.VERSION}`, true)
        .addField("Runtime", `Node.js ${process.version}`, true)
        .addField("Version", `${lastGitCommit}`, true)
        .addField("Language", `TypeScript ${typescript_version}`, true)
        .addField("Uptime", `Since the bot has started:\n**${uptime()}**\nSince the shard has restarted:\n**${dateToString(new Date(shard_uptime))}**`, true)
        .addField("Memory Usage", `RSS: ${bytesToMB(memoryUsage.rss)}
External: ${bytesToMB(memoryUsage.external)}
Heap Total: ${bytesToMB(memoryUsage.heapTotal)}
Heap Used: ${bytesToMB(memoryUsage.heapUsed)}`, true)
        .setFooter("Powered by Mov", msg.author.avatarURL)
    client.createMessage(msg.channel.id, e.build())
}

class BotInfo extends MovCommand {
    constructor() {
        super("botinfo", generator, {
            aliases: ["info"]
        })
    }
}

export default new BotInfo();