import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { lavalink } from "../../client/Lavalink";

function generator(msg: Message, _args: string[]) {
    if (client.queue.size < 2) {
        client.createMessage(msg.channel.id, "The queue contains only one track, cannot be skipped. You can also use `$stop` to do so.")
        return
    }
    const node = lavalink.getNode()
    if (!node) return;
    const player = node.players.get(msg.guildID!)
    if (!player || !player.track) {
        client.createMessage(msg.channel.id, "There's nothing to play")
        return
    }

    const trackToBeRemoved = client.queue.first()!
    client.queue.delete(trackToBeRemoved.track)
    player.playTrack({
        ...client.queue.first()!,
        options: {
            noReplace: false
        }
    })
    client.createMessage(msg.channel.id, "Skipped!")
}

class Skip extends MovCommand {
    constructor() {
        super("skip", generator, {})
    }
}

export default new Skip();