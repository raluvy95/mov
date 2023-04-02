import { AutocompleteInteraction, CommandInteraction, ComponentInteraction, Message, PingInteraction, UnknownInteraction } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { Data2 } from "../../interfaces/reddit";
import { getSubreddit, parseToEmbed } from "../../utils/reddit";

async function generator(msg: Message, args: string[]) {
    if (!args[0]) {
        client.createMessage(msg.channel.id, "Please input specific subreddit")
        return
    }
    let page = 0
    let contents: Data2[] | null = null
    try {
        contents = await getSubreddit(args.join("_"), {
            includeStickied: false,
            limit: 20
        })
    } catch (e) {
        client.createMessage(msg.channel.id, `${e}`)
        return
    }
    if (!contents) return;
    if (contents.length < 1) {
        client.createMessage(msg.channel.id, `Empty content? You either look for empty subreddit or the subreddit is full of nsfw`)
    }

    const orgMsg = await client.createMessage(msg.channel.id, {
        ...parseToEmbed(contents[page]).setAuthor(`Page ${page + 1}/${contents.length}`).build(),
        components: [
            {
                type: 1,
                components: [
                    {
                        custom_id: "back",
                        type: 2,
                        style: 2,
                        emoji: {
                            name: "⬅️"
                        }
                    },
                    {
                        custom_id: "forward",
                        type: 2,
                        style: 2,
                        emoji: {
                            name: "➡️"
                        }
                    },
                    {

                        custom_id: "stop",
                        type: 2,
                        style: 4,
                        emoji: {
                            name: "🛑"
                        }
                    }
                ]
            }
        ]
    })
    async function interactionCreate(i: PingInteraction | CommandInteraction | ComponentInteraction | AutocompleteInteraction | UnknownInteraction) {
        if (!contents) return;
        if (i.type === 3) {
            if (!i.acknowledged) {
                await i.acknowledge({ type: 7 })
            }
            switch ((i.data! as any).custom_id) {
                case "back":
                    if (page <= 0) {
                        page = 0
                    } else {
                        page--
                    }
                    await i.editMessage(orgMsg.id, { ...parseToEmbed(contents[page]).setAuthor(`Page ${page + 1}/${contents.length}`).build() })
                    break
                case "forward":
                    if (page >= (contents.length - 1)) {
                        page = contents.length - 1
                    } else {
                        page++
                    }
                    await i.editMessage(orgMsg.id, { ...parseToEmbed(contents[page]).setAuthor(`Page ${page + 1}/${contents.length}`).build() })
                    break
                case "stop":
                    await i.editMessage(orgMsg.id, { components: [] })
                    client.removeListener("interactionCreate", interactionCreate)
                    break
            }
        }
    }
    client.on("interactionCreate", interactionCreate)
}

class Reddit extends MovCommand {
    constructor() {
        super("reddit", generator, {
            aliases: ["r"],
            cooldown: 30 * 1000
        })
    }
}

export default new Reddit();