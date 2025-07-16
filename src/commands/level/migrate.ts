import { Message, TextChannel } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { ILevelDB } from "../../interfaces/database";
import { MessageCollector } from "../../lib/eris-collect";

async function generator(msg: Message, args: string[]) {
    const userId = args[0];
    const anotherUserId = args[1];
    if (!userId || !anotherUserId) {
        client.createMessage(
            msg.channel.id,
            `Usage: \`${msg.prefix}migrate <src-userid> <dest-userid>\``,
        );
        return;
    }
    const srcUserId = await client.database.level.get<ILevelDB>(userId);
    if (!srcUserId) {
        client.createMessage(msg.channel.id, "Cannot find that source user. Use the command `adduserlb` to add this user.")
        return;
    }

    const filter = (message: Message) => message.author.id === msg.author.id;
    const collector = new MessageCollector(client, msg.channel as TextChannel, {
        filter,
        time: 30000,
        max: 1,
    });
    client.createMessage(
        msg.channel.id,
        `Do you want to remove this source user's level?`,
    );
    collector.on("end", (c) => {
        const msg = c[0];
        if (msg.content.toLowerCase().startsWith("y")) {
            client.database.level.delete(userId);
            proceed()
        } else {
            client.createMessage(msg.channel.id, "Ok, won't delete ");
            proceed()
        }
    });

    function proceed() {
        client.database.level.set<ILevelDB>(anotherUserId, {
            xp: Number(srcUserId?.xp),
            level: Number(srcUserId?.level),
            totalxp: Number(srcUserId?.totalxp),
        });
        client.createMessage(
            msg.channel.id,
            `Successfully migrated to \`${anotherUserId}\`!`,
        );
    }
    return;
}

class Migrate extends MovCommand {
    constructor() {
        super("migrate", generator, {
            description: "Copy from another user. Requires owner permission",
            usage: "<src-userid> <dest-userid>",
            requirements: {
                userIDs: process.env.OWNER_ID!.split(" ")
            }
        })
    }
}

export default new Migrate();