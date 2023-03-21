import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { ISettingsDB } from "../../interfaces/database";

async function generator(msg: Message, args: string[]) {
    if (args.length < 1) {
        const { prefix } = (await client.database.settings.get<ISettingsDB>(msg.guildID!))!
        client.createMessage(msg.channel.id, `The global prefix is ${prefix}\nUse \`$prefix <new prefix>\` to change the prefix!.\nTo change user prefix, please use \`$userconfig prefix <new prefix>\` instead`)
        return
    }
    client.database.settings.set(`${msg.guildID!}.prefix`, args[0].replace(/"/g, ''))
    client.createMessage(msg.channel.id, `Sucessfully set global prefix to \`${args[0]}\`!`)
}

class Prefix extends MovCommand {
    constructor() {
        super("prefix", generator, {
            requirements: {
                permissions: {
                    administrator: true
                }
            }
        })
    }
}

export default new Prefix();