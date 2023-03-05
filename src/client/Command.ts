import { CommandOptions, CommandGenerator } from "eris";
import { client } from "./Client";

export class MovCommand {
    public label: string
    public generator: CommandGenerator
    public options?: CommandOptions
    constructor(label: string, generator: CommandGenerator, options?: CommandOptions) {
        this.label = label
        this.generator = generator
        this.options = {
            caseInsensitive: true,
            cooldown: 3,
            hooks: {
                preCommand(msg, _args) {
                    if(!process.env.SERVER_ID) throw new Error("The env SERVER_ID is undefined")
                    if(msg.guildID != process.env.SERVER_ID) {
                        return
                    }
                },
                async postCheck(_m, _, c) {
                    if(!c) return;
                    if(await client.database.cmdStat.has(label)) {
                        client.database.cmdStat.add(label, 1)
                    } else {
                        client.database.cmdStat.set(label, 1)
                    }
                }
            },
            ...options
        }
    }
}