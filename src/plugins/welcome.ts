import { MovPlugin } from "../client/Plugin";
import { greeting } from "../utils/greeting";

export default new MovPlugin("welcome", {
    event: "guildMemberAdd",
    async run(guild, member) {
        await greeting("w", guild, member);
    },
});
