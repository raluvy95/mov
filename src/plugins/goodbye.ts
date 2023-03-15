import { client } from "../client/Client";
import { MovPlugin } from "../client/Plugin";
import { greeting } from "../utils/greeting";

export default new MovPlugin("goodbye", {
    event: "guildMemberRemove",
    async run(guild, member) {
        await greeting("g", guild, member)
    }
})