import { CommandClient } from 'eris';
import { LevelDB, MovDB, SettingsDB, UserDB } from './Database';
import { readdirSync } from 'fs';
import { MovCommand } from './Command';

interface ClientDatabase {
    level: MovDB
    settings: MovDB
    user: MovDB
}

class Mov extends CommandClient {

    public database: ClientDatabase

    constructor() {
        if (!process.env.DISCORD_TOKEN) throw new Error("The env DISCORD_TOKEN is undefined")
        super(process.env.DISCORD_TOKEN, {
            intents: ["guildMembers", "guildMessages"]
        }, {
            prefix: "$"
        })
        this.database = {
            level: new LevelDB(),
            settings: new SettingsDB(),
            user: new UserDB()
        };

        (async () => await this.init())()
    }

    private async init() {
        if (await this.database.settings.has('prefix')) {
            if (!process.env.SERVER_ID) throw new Error("The env SERVER_ID is undefined");
            this.registerGuildPrefix(process.env.SERVER_ID, await this.database.settings.get('prefix') || "$")
        }

        this.unregisterCommand("help")

        const modules = readdirSync("./build/commands")
        for (const mod of modules) {
            const commands = readdirSync(`./build/commands/${mod}`)
            for (const cmd of commands) {
                try {
                    const command: { default: MovCommand } = await import(`../commands/${mod}/${cmd}`)
                    this.registerCommand(command.default.label, command.default.generator, command.default.options)
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }
}

export const client = new Mov()

if (!process.env.SERVER_ID) throw new Error("The env SERVER_ID is undefined")

client.registerCommand("ping", "PONG!!!")