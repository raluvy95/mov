import { CommandOptions, CommandGenerator } from "eris";
import { client } from "./Client";

export class MovCommand {
    public label: string
    public generator: CommandGenerator
    public options?: CommandOptions & { useBasicArgSplit: boolean }

    constructor(label: string, generator: CommandGenerator, options?: CommandOptions & { useBasicArgSplit?: boolean }) {
        this.label = label
        this.generator = generator
        this.options = {
            caseInsensitive: true,
            cooldown: 3 * 1000,
            cooldownMessage: { content: "**CALM DOWN!**" },
            hooks: {
                async postCheck(_m, _, c) {
                    if (!c) return;
                    if (await client.database.cmdStat.has(label)) {
                        client.database.cmdStat.add(label, 1)
                    } else {
                        client.database.cmdStat.set(label, 1)
                    }
                }
            },
            guildOnly: true,
            useBasicArgSplit: false,
            ...options
        }
    }
}