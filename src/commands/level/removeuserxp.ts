import { Message, TextChannel } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { getUser } from "../../utils/get";
import { MessageCollector } from 'eris-collect'
async function generator(msg: Message, args: string[]) {
    if (!isNaN(Number(args[0]))) {
        const success = await client.database.level.delete(args[0])
        if (!success) {
            client.createMessage(msg.channel.id, `That ID doesn't exist in level database`)
        } else {
            client.createMessage(msg.channel.id, `Removed \`${args[0]}\`'s level database!`)
        }
        return
    }
    const user = await getUser(msg, args.join(" "))
    if (!user) {
        client.createMessage(msg.channel.id, "Cannot find that user.")
        return
    }

    const filter = (message: Message) => message.author.id === msg.author.id
    const collector = new MessageCollector(client, msg.channel as TextChannel, { filter, time: 30000, max: 1 })
    client.createMessage(msg.channel.id, `Are you sure you want to remove **${user.username}#${user.discriminator}**'s level? [Type 'yes' or 'y' to confirm]`)
    collector.on("end", (c) => {
        const msg = c[0]
        if (["yes", "y"].includes(msg.content)) {
            client.database.level.delete(user.id)
            client.createMessage(msg.channel.id, "Removed!")
        } else {
            client.createMessage(msg.channel.id, "Ok, cancelled.")
        }
    })
}

class removeUserXP extends MovCommand {
    constructor() {
        super("removeuserxp", generator, {
            aliases: ["removeuxp", "rmuserxp"],
            requirements: {
                permissions: {
                    administrator: true
                }
            },
            cooldown: 60 * 1000
        })
    }
}

export default new removeUserXP();