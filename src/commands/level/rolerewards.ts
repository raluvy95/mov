import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import { MovEmbed } from "../../client/Embed";
import { ISettingsDB } from "../../interfaces/database";
import { getGuildByID } from "../../utils/get";

async function generator(msg: Message, args: string[]) {
    const ranks = await client.database.settings.get<ISettingsDB>(msg.guildID!);
    const level = ranks?.modules.level;
    if (!level || !level?.enable) {
        client.createMessage(msg.channel.id, "Leveling is disabled");
        return;
    }

    if (!level.roleRewards || level.roleRewards.length < 1) {
        client.createMessage(msg.channel.id, "Role rewards is empty :(");
        return;
    }

    let page = 1;
    const maxPage = Math.ceil(level.roleRewards.length / 15);

    if (!isNaN(Number(args[0]))) {
        page = Number(args[0]);
    }

    if (page > maxPage) {
        page = maxPage;
    }

    const filtered = level.roleRewards
        .sort((a, b) => a.level - b.level)
        .slice((page - 1) * 15, page * 15);

    let result = "";
    for (const role of filtered) {
        result += `Level **${role.level}** - <@&${role.ID}>\n`;
    }

    const { iconURL } = await getGuildByID(msg.guildID!);
    const e = new MovEmbed()
        .setTitle(`Role Rewards [${level.roleRewards.length}]`)
        .setDesc(result)
        .setThumb(iconURL || client.user.avatarURL)
        .setFooter(`Page ${page}/${maxPage}`);
    client.createMessage(msg.channel.id, e.build());
}

class Ranks extends MovCommand {
    constructor() {
        super("rolerewards", generator, {
            aliases: ["rolerewards", "rankrewards", "roler", "ranks"],
        });
    }
}

export default new Ranks();
