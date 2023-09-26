import { Message, TextChannel } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { ISettingsDB } from "../../interfaces/database";
import { makeid } from "../../utils/makeid";
import { MessageCollector } from "eris-collect";

async function generator(msg: Message, args: string[]) {
    if (args.length < 1) {
        const { prefix } = (await client.database.settings.get<ISettingsDB>(
            msg.guildID!,
        ))!;
        client.createMessage(
            msg.channel.id,
            `The global prefix is ${prefix}\nUse \`$prefix <new prefix>\` to change the prefix!.\nTo change user prefix, please use \`$userconfig prefix <new prefix>\` instead`,
        );
        return;
    }

    const id = makeid(6);
    const filter = (message: Message) => message.author.id === msg.author.id;
    const collector = new MessageCollector(client, msg.channel as TextChannel, {
        filter,
        time: 30000,
        max: 1,
    });
    client.createMessage(
        msg.channel.id,
        `Are you sure you want to change this bot's prefix to \`${args[0].replace(/"/g, "")}\`?\nPlease type \`${id}\` to confirm!`,
    );
    collector.on("end", (c) => {
        const msg = c[0];
        if (msg.content === id) {
            client.database.settings.set(
                `${msg.guildID!}.prefix`,
                args[0].replace(/"/g, ""),
            );
            client.createMessage(
                msg.channel.id,
                `Sucessfully set global prefix to \`${args[0]}\`!`,
            );
        } else {
            client.createMessage(msg.channel.id, "Ok, cancelled.");
        }
    });
}

class Prefix extends MovCommand {
    constructor() {
        super("prefix", generator, {
            requirements: {
                permissions: {
                    administrator: true,
                },
            },
        });
    }
}

export default new Prefix();
