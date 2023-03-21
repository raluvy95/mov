import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";
import { lavalink } from "../../client/Lavalink";
import { microsecToString } from "../../utils/microsecToString";

function generator(msg: Message, _args: string[]) {
    const node = lavalink.getNode()
    if (!node) return;
    const player = node.players.get(msg.guildID!)
    if (!player || !player.track) {
        client.createMessage(msg.channel.id, "There's nothing to play")
        return
    }

    const info = client.queue.get(player.track)
    if (!info) {
        // Blame cosmic ray for this
        // I swear I trutly added the track to the queue before starting playing new track
        client.createMessage(msg.channel.id, "A rare error has occured")
        return
    }

    const e = new MovEmbed()
        .setTitle("Now playing")
        .setDesc(`**Title:** ${info.info.title}\n**Author:** ${info.info.author}\n**Duration:** ${microsecToString(info.info.length)}\n**URL:** [click here to open](${info.info.uri})`)
        .addField("Source", info.info.sourceName, true)
        .addField("Streamable?", !info.info.isStream ? "No" : "Yes", true)
        .addField("Seekable?", !info.info.isSeekable ? "No" : "Yes", true)
        .addField("ID", info.info.identifier)
    if (info.info.sourceName == "youtube") {
        e.setThumb(`https://img.youtube.com/vi/${info.info.identifier}/hqdefault.jpg`)
    }
    client.createMessage(msg.channel.id, e.build())
}

class NowPlaying extends MovCommand {
    constructor() {
        super("nowplaying", generator, {
            aliases: ["np", "nowp", "nplaying"]
        })
    }
}

export default new NowPlaying();