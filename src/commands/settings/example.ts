import { Modules } from "../../interfaces/module";
import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";

type base = {
    [s in keyof Modules]: string;
};

export const EXAMPLE: base = {
    welcome: `
set channelId "1234567890123"
set message Hey {mention}! Welcome to the {server}! We now have {memberCount} members!
set ignoreBot true`,
    goodbye: `
set channelId "1234567890123"
set message Hey {name}! Welcome to the {server}! We now have {memberCount} members!
set ignoreBot true`,
    level: `
set lvlUp.channelId "1234567890123" (or set to "0" to send in a channel where the user was sent)
set lvlUp.message {mention} reached level **{level}**!
add roleRewards {"ID": "1234567890123", "level": 5}
add ignoreChannel "1234567890123"
add excludeRole "1234567890123"
set multiplyXP 2
set maxXP 50
set minXP 30`,
    rss: `
add instances {"name": "New instance", "url": ["https://url.to.rss"], "channelId": "1234567890123"}
set customMsg New news just dropped! {link}`,
    bump: `
set roleID 1234567890123`,
    autopublish: "",
    messageReference: "",
    clock: "",
    autoMessageForum: `
set message "thank you for creating new post xd"`,
};

export const VARIABLES: base = {
    welcome: `
    \`{mention}\` - member's mention
    \`{name}\` - member's name,
    \`{server}\` - this server's name
    \`{memberCount}\` - this server's member count
    `,
    goodbye: `
    \`{name}\` - member's name,
    \`{server}\` - this server's name
    \`{memberCount}\` - this server's member count
    `,
    level: `
    \`{level}\` - member's level that just reached
    \`{mention}\` - member's mention (unmentionable if opt-out by member)
    `,
    rss: `
    \`{title}\` - The RSS' title
    \`{url}\` - Link to RSS article
    `,
    bump: "",
    autopublish: "",
    messageReference: "",
    clock: "",
    autoMessageForum: "",
};

function generator(msg: Message, _args: string[]) {
    const e = new MovEmbed().setTitle("Examples of config");
    let r = "";
    for (const [k, v] of Object.entries(EXAMPLE)) {
        if (v.length < 1) continue;
        r += `**${k}**\n\`${v}\`\n`;
    }
    r += "__**Variables**__\n";
    for (const [k, v] of Object.entries(VARIABLES)) {
        if (v.length < 1) continue;
        r += `**${k}**\n${v}\n`;
    }
    e.setDesc(r).addField(
        "How to change?",
        `Use ${msg.prefix}conf <module> set <key> <value>\nTo change prefix for this bot, please use \`${msg.prefix}prefix <value>\`\n\nYou can also use \`add\` or \`remove\` subcommand to add new value if key's type is [an array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) (doesn't support multiple key sadly)`,
    );
    client.createMessage(msg.channel.id, e.build());
}

class Example extends MovCommand {
    constructor() {
        super("example", generator, {
            cooldown: 6 * 1000,
            hidden: true,
            aliases: ["examples"],
            requirements: {
                permissions: {
                    administrator: true,
                },
            },
        });
    }
}

export default new Example();
