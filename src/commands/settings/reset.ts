import { Message, TextChannel } from "eris";
import { MessageCollector } from "../../lib/eris-collect";
import { client, ClientDatabase } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { DEFAULT_SERVER_SETTINGS } from "../../constant/defaultConfig";

function generator(msg: Message, args: string[]) {
    const allDatabase = Object.keys(client.database);

    let target: string;
    if (!args[0]) {
        target = "all";
    } else {
        if (!allDatabase.includes(args[0])) {
            client.createMessage(msg.channel.id, "Invalid");
            return;
        }
        target = args[0];
    }
    const filter = (message: Message) => message.author.id === msg.author.id;
    const collector = new MessageCollector(client, msg.channel as TextChannel, {
        filter,
        time: 30000,
        max: 1,
    });
    client.createMessage(
        msg.channel.id,
        `Are you sure you want to reset \`${target}\``,
    );
    collector.on("end", (c) => {
        const msg = c[0];
        if (msg.content.toLowerCase().startsWith("y")) {
            if (target === "all") {
                for (const k of allDatabase) {
                    if (k === "settings") {
                        client.database.settings.set(
                            msg.guildID!,
                            DEFAULT_SERVER_SETTINGS,
                        );
                    } else {
                        client.database[k as keyof ClientDatabase].deleteAll();
                    }
                }
            } else {
                switch (target as keyof ClientDatabase) {
                    case "settings":
                        client.database.settings.set(
                            msg.guildID!,
                            DEFAULT_SERVER_SETTINGS,
                        );
                        break;
                    default:
                        client.database[
                            target as keyof ClientDatabase
                        ].deleteAll();
                        break;
                }
            }
            client.createMessage(
                msg.channel.id,
                `Successfully purged \`${target}\`!`,
            );
        } else {
            client.createMessage(msg.channel.id, "Ok, cancelled.");
        }
    });
}

class Reset extends MovCommand {
    constructor() {
        super("reset", generator, {
            description: "Reset specific or all tables to default or empty.",
            requirements: {
                userIDs: process.env.OWNER_ID!.split(" "),
            },
            hidden: true,
        });
    }
}

export default new Reset();
