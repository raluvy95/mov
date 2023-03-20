import { Message } from "eris";
import { Player, Track } from "shoukaku";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { lavalink } from "../../client/Lavalink";

async function generator(msg: Message, args: string[]) {
    const userIsOnVoice = msg.member!.voiceState.channelID

    if (!userIsOnVoice) {
        client.createMessage(msg.channel.id, "You are not in a voice")
        return
    }
    const node = lavalink.getNode()
    if (!node) return;
    const result = await node.rest.resolve(`ytsearch:${args.join(" ")}`);
    if (!result) {
        client.createMessage(msg.channel.id, "Cannot find your results")
        return
    }
    let metadata: Track;
    switch (result?.loadType) {
        case 'LOAD_FAILED':
            client.createMessage(msg.channel.id, "Failed to load your results")
            return
        case 'NO_MATCHES':
            client.createMessage(msg.channel.id, "Cannot find your results")
            return
        case 'PLAYLIST_LOADED':
            for (const track of result.tracks) {
                client.queue.set(track.track, track)
            }
            metadata = result.tracks.shift()!
            client.createMessage(msg.channel.id, `Added a playlist to queues! **${result.playlistInfo.name!}**`)
            break
        case 'SEARCH_RESULT':
            metadata = result.tracks.shift()!
            break
        case 'TRACK_LOADED':
            metadata = result.tracks.shift()!
            break
    }

    let player: Player | undefined = node.players.get(msg.guildID!)
    if (!player) {
        player = await node.joinChannel({
            guildId: msg.guildID!,
            channelId: userIsOnVoice,
            shardId: 0
        });
    }
    if (!player.track) {
        player.playTrack(metadata)
    } else {
        client.createMessage(msg.channel.id, `Added **${metadata.info.title}** to the queue!`)
    }
    client.queue.set(metadata.track, metadata)
    if (player.listenerCount("end") < 1) {
        player.on("end", (e) => {
            if (e.reason == "STOPPED") {
                client.queue.clear()
                client.leaveVoiceChannel(userIsOnVoice)
            }

            console.log(client.queue.size)
            if (client.queue.size < 1) {
                client.leaveVoiceChannel(userIsOnVoice)
                client.createMessage(msg.channel.id, `Quitted because there's nothing to play`)
                return
            } else {
                const trackToBeRemoved = client.queue.first()!
                client.queue.delete(trackToBeRemoved.track)
                const nextTrack = client.queue.first()
                player?.playTrack(nextTrack!)
            }
        })
    }
    if (player.listenerCount("start") < 1) {
        player.on("start", t => {
            const currentPlayer = client.queue.get(t.track)
            client.createMessage(msg.channel.id, `**${currentPlayer?.info.title}** is now playing`)
        })
    }
}

class Play extends MovCommand {
    constructor() {
        super("play", generator, {})
    }
}

export default new Play();