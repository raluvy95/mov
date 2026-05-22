import Eris, { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";
import { asyncSafeExec } from "../../utils/asyncSafeExec";
import { dateToString } from "../../utils/dateToString";

function uptime() {
    const up = Math.floor(process.uptime()) * 1000;
    function secondsToDhms(seconds: number): string {
        seconds = Number(seconds);
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        const dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
        const hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
        const mDisplay =
            m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
        const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
        return dDisplay + hDisplay + mDisplay + sDisplay;
    }
    return secondsToDhms(up / 1000);
}

function bytesToMB(bytes: number) {
    const mb = bytes / 1024 ** 2;
    return `${mb.toFixed(0)} MB`;
}

async function generator(msg: Message, args: string[]) {
    const shard_uptime = client.startTime;
    const memoryUsage = process.memoryUsage();
    let typescript_version: RegExpMatchArray | string | null = (await asyncSafeExec("bunx", ["tsc", "-v"])).match(/\d+(\.\d+)*/);
    if (!typescript_version) {
        typescript_version = "???"
    } else {
        typescript_version = typescript_version[0]
    }
    let lastGitCommit = "";
    try {
        lastGitCommit = await asyncSafeExec("git", [
            "log",
            '--pretty=format:"%h"',
            "-1",
        ]);
        // strip the literal double-quotes and any trailing line breaks
        lastGitCommit = lastGitCommit.replace(/"/g, '').trim();
    } catch {
        lastGitCommit = "No version was found";
    }

    if (!args[0]) {
        const e = new MovEmbed()
            .setTitle("Bot info")
            .setDesc("A cool Discord bot")
            .addField("Library", `Eris v${Eris.VERSION}`, true)
            .addField("Runtime", `Node.js ${process.version}`, true)
            .addField("Version", `${lastGitCommit}`, true)
            .addField("Language", `TypeScript v${typescript_version}`, true)
            .addField(
                "Uptime",
                `Since the bot has started:\n**${uptime()}**\nSince the shard has restarted:\n**${dateToString(
                    new Date(shard_uptime),
                )}**`,
                true,
            )
            .addField(
                "Memory Usage",
                `RSS: ${bytesToMB(memoryUsage.rss)}
External: ${bytesToMB(memoryUsage.external)}
Heap Total: ${bytesToMB(memoryUsage.heapTotal)}
Heap Used: ${bytesToMB(memoryUsage.heapUsed)}`,
                true,
            )
            .setFooter("Powered by Mov", msg.author.avatarURL);
        await client.createMessage(msg.channel.id, e.build());
    } else if (args[0].startsWith("c")) {
        let result = "```ansi\n" +
            `{1}M     {2}OOOOO{1}     M     \x1b[1;4m\x1b[2;37m${msg.author.username}\x1b[0;0m\x1b[0m
{1}MM  {2}OO     OO{1}  MM     {3}Version:{0} ${lastGitCommit}
{1}MM{2}OO         OO{1}MM     {3}Library:{0} Eris v${Eris.VERSION}
{1}M{2}OO{3}VV       VV{2}OO{1}M     {3}Runtime:{0} Node.js ${process.version}
{2}OO{1}MM{3}VV     VV{1}MM{2}OO     {3}Language:{0} TypeScript v${typescript_version}
{1}M{2}OO{1}MM{3}VV   VV{1}MM{2}OO{1}M     {3}Uptime:{0} ${uptime()}
{1}MM{2}OO{1}MM{3}VV VV{1}MM{2}OO{1}MM     {3}Memory:{0} ${bytesToMB(memoryUsage.rss)}
{1}MMM {2}OO{1}M{3}VVV{1}M{2}OO {1}MMM    
{1}MMM   {2}OOOOO   {1}MMM    
{1}MMM           MMM      \x1b[2;40m\x1b[2;30m███\x1b[0m\x1b[2;40m\x1b[0m\x1b[2;31m\x1b[0m\x1b[2;30m███\x1b[0m\x1b[2;31m███\x1b[0m\x1b[2;32m███\x1b[0m\x1b[2;33m███\x1b[0m\x1b[2;34m███\x1b[0m\x1b[2;35m███\x1b[0m\x1b[2;36m███\x1b[0m\x1b[2;37m███\x1b[0m\n` +
            "```";

        result = result
            .replaceAll("{0}", "\x1b[0;0m")
            .replaceAll("{1}", "\x1b[2;30m")
            .replaceAll("{2}", "\x1b[2;34m")
            .replaceAll("{3}", "\x1b[2;35m");

        await client.createMessage(msg.channel.id, result);
    }
}

class BotInfo extends MovCommand {
    constructor() {
        super("botinfo", generator, {
            aliases: ["info"],
        });
    }
}

export default new BotInfo();
