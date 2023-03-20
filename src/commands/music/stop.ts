import { Message } from "eris";
import { Player } from "shoukaku";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { lavalink } from "../../client/Lavalink";

function generator(msg: Message, _args: string[]) {
    const node = lavalink.getNode()
    if (!node) return;

    let player: Player | undefined = node.players.get(msg.guildID!)
    if (!player) {
        client.createMessage(msg.channel.id, "There's nothing to play")
        return
    }
    player.stopTrack()
    client.createMessage(msg.channel.id, "Stopped!")
}

class Stop extends MovCommand {
    constructor() {
        super("stop", generator, {})
    }
}

export default new Stop();