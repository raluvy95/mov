import { Message, TextChannel } from "eris";
import { MessageCollector } from "../../lib/eris-collect"
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { makeid } from "../../utils/makeid";

function generator(msg: Message, _args: string[]) {
    const id = makeid(6);
    const filter = (message: Message) => message.author.id === msg.author.id;
    const collector = new MessageCollector(client, msg.channel as TextChannel, {
        filter,
        time: 30000,
        max: 1,
    });
    client.createMessage(
        msg.channel.id,
        `Are you sure to nuke the leaderboard? **THIS ACTION CANNOT BE REVERTED**\nPlease type \`${id}\` to confirm!`,
    );
    collector.on("end", (c) => {
        const msg = c[0];
        if (msg.content === id) {
            client.database.level.deleteAll();
            client.createMessage(msg.channel.id, "NUKED!");
        } else {
            client.createMessage(msg.channel.id, "Ok, cancelled.");
        }
    });
}

class NukeLeaderboard extends MovCommand {
    constructor() {
        super("nukeleaderboard", generator, {
            aliases: ["nukelb", "removeallxp", "removealllb", "nukexp"],
            requirements: {
                userIDs: process.env.OWNER_ID!.split(" "),
            },
            hidden: true,
        });
    }
}

export default new NukeLeaderboard();
