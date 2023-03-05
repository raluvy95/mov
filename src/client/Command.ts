import { CommandOptions, CommandGenerator } from "eris";

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
            },
            ...options
        }
    }
}