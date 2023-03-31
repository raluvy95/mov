import { CommandClient, GeneratorFunctionReturn, Message, TextableChannel } from 'eris';
import { CmdStatDB, LevelDB, MovDB, SettingsDB, UserDB } from './Database';
import { readdirSync } from 'fs';
import { MovCommand } from './Command';
import { MovPlugin } from './Plugin';
import { Collection } from '@discordjs/collection';
import { ISettingsDB, IUserDB } from '../interfaces/database';

export interface ClientDatabase {
    level: MovDB
    settings: SettingsDB
    user: MovDB,
    cmdStat: MovDB
}

class Mov extends CommandClient {

    public database: ClientDatabase
    public cooldownLevel: Map<string, number>

    constructor() {
        if (!process.env.DISCORD_TOKEN) throw new Error("The env DISCORD_TOKEN is undefined")
        if (!process.env.SERVER_ID) throw new Error("The env SERVER_ID is undefined");
        super(process.env.DISCORD_TOKEN, {
            intents: ["guildMembers", "guildMessages", "guilds", "guildMembers",
                "guildMessageReactions", "guildWebhooks", "guildEmojis",
                "guildVoiceStates"],
            restMode: true,
        }, {
            prefix: ["$", "sudo "],
            owner: "CatNowBlue",
            defaultHelpCommand: false,
            argsSplitter(str: string) {
                // don't split in quotes
                const match = str.match(/(("|').*?("|')|([^"\s]|[^'\s])+)+(?=\s*|\s*$)/g)
                if (!match) {
                    return str.split(/\s+/g)
                } else {
                    return match
                }
            },
        })
        this.removeAllListeners("messageCreate")
        this.database = {
            level: new LevelDB(),
            settings: new SettingsDB(process.env.SERVER_ID),
            user: new UserDB(),
            cmdStat: new CmdStatDB()
        };

        this.cooldownLevel = new Collection();

        (async () => await this.init())()
    }

    private async userCommandResolver(label: string, userDB?: IUserDB | null) {
        if (!userDB) return undefined;

        label = userDB.aliases.find(m => m.alias.includes(label))?.commandTarget || label;
        let command = this.commands[label];
        if (command) {
            return command;
        }
        label = label.toLowerCase();
        label = this.commandAliases[label] || label;
        command = this.commands[label];
        if (command?.caseInsensitive) {
            return command;
        }
    }

    private async commandHandler(msg: Message<any>, userDB?: IUserDB | null) {
        const args = (this.commandOptions.argsSplitter!(msg.content.replace(/<@!/g, "<@").substring(msg.prefix!.length).trim())) as string[];
        const label = args.shift();
        if (!label) return;
        let command

        command = await this.userCommandResolver(label, userDB);
        if (!command) {
            command = this.resolveCommand(label);
        }

        if (command !== undefined) {
            msg.command = command;
            try {
                let resp: GeneratorFunctionReturn = await msg.command.process(args, msg);
                let m: Message<TextableChannel> | undefined = undefined
                if (resp != null) {
                    m = await this.createMessage(msg.channel.id, resp);
                    if (msg.command.reactionButtons) {
                        msg.command.reactionButtons.forEach((button) => m!.addReaction(button.emoji));
                        this.activeMessages[m.id] = {
                            args: args,
                            command: msg.command,
                            timeout: setTimeout(() => {
                                this.unwatchMessage(m!.id, m!.channel.id);
                            }, msg.command.reactionButtonTimeout)
                        };
                    }
                }
                if (msg.command.hooks.postCommand) {
                    msg.command.hooks.postCommand(msg, args, m);
                }
            } catch (err) {
                this.emit("error", err);
                if (msg.command.hooks.postExecution) {
                    msg.command.hooks.postExecution(msg, args, false);
                }
                let newMsg;
                if (msg.command.errorMessage) {
                    try {
                        if (typeof msg.command.errorMessage === "function") {
                            // @ts-ignore
                            const reply = await msg.command.errorMessage(msg, err);
                            if (reply !== undefined) {
                                newMsg = await this.createMessage(msg.channel.id, reply);
                            }
                        } else {
                            newMsg = await this.createMessage(msg.channel.id, msg.command.errorMessage);
                        }
                    } catch (err) {
                        this.emit("error", err);
                    }
                }
                if (msg.command.hooks.postCommand) {
                    msg.command.hooks.postCommand(msg, args, newMsg);
                }
            }
        }
    }

    private async checkPrefixMod(msg: Message<any>) {
        let prefixes = this.commandOptions.prefix;
        const userPref = await this.database.user.get<IUserDB>(msg.author.id)
        const server = await this.database.settings.get<ISettingsDB>(msg.guildID!)

        if (userPref?.prefix || server?.prefix) {
            prefixes = userPref?.prefix || server?.prefix
        } else if (msg.mentions.includes(this.user)) {
            prefixes = this.user.id
            msg.prefix = `<@${this.user.id}>`
        } else if (msg.channel.guild !== undefined && this.guildPrefixes[msg.channel.guild.id] !== undefined) {
            prefixes = this.guildPrefixes[msg.channel.guild.id];
        }
        if (typeof prefixes === "string") {
            if (!msg.content.replace(/<@!/g, "<@").startsWith(prefixes) && typeof server?.prefix === "string") {
                prefixes = server?.prefix
            }
            return msg.content.replace(/<@!/g, "<@").startsWith(prefixes) && prefixes;
        } else if (Array.isArray(prefixes)) {
            return prefixes.find((prefix) => msg.content.replace(/<@!/g, "<@").startsWith(prefix));
        }
        throw new Error(`Unsupported prefix format | ${prefixes}`);
    }

    /*
      When default onMessageCreate is so bad that
      it raises TypeError on TypeScript LOL

      had to modify onMessageCreate
      so I could add user-made aliases/prefixes

      best eris command 10/10
    */
    override async onMessageCreate(msg: Message<any>) {
        if (!this.ready) {
            return;
        }
        if (msg.author.bot) return;
        (msg.command as any) = false;

        if (msg.mentions.includes(this.user) && msg.type == 0) {
            const userPref = await this.database.user.get<IUserDB>(msg.author.id)
            const server = await this.database.settings.get<ISettingsDB>(msg.guildID!)
            const responseU = userPref?.prefix ? `Your user prefix is \`${userPref.prefix}\`` : ''
            const responseS = server?.prefix ? `The bot's prefix is \`${server.prefix}\`` : ''
            const com = responseU + " " + responseS
            if (com.length == 1) {
                client.createMessage(msg.channel.id, "Hello! You can response me with mention! Use `<@" + this.user.username + "> help` to get started!")
            } else {
                client.createMessage(msg.channel.id, `Hey!\n${com}`)
            }
        }

        const userPref = await this.database.user.get<IUserDB>(msg.author.id)
        if ((msg.prefix as any) = await this.checkPrefixMod(msg)) {
            this.commandHandler(msg, userPref || undefined)
        }
    }


    private async init() {
        if (!process.env.SERVER_ID) throw new Error("The env SERVER_ID is undefined");

        // Command handler
        const modules = readdirSync("./build/commands")
        for (const mod of modules) {
            const commands = readdirSync(`./build/commands/${mod}`).filter(m => !m.startsWith("."))
            for (const cmd of commands) {
                try {
                    const command: { default: MovCommand } = await import(`../commands/${mod}/${cmd}`)
                    this.registerCommand(command.default.label, command.default.generator, command.default.options)
                } catch (e) {
                    console.error(e)
                    continue
                }
            }
        }

        // Event (also called as Plugin) handler
        const plugins = readdirSync("./build/plugins")
        this.on("messageCreate", this.onMessageCreate)
        this.on("messageUpdate", (msg, oldMsg) => {
            if (oldMsg?.content == msg.content) return;
            this.onMessageCreate(msg)
        })
        for (const plugin of plugins) {
            try {
                const plug: { default: MovPlugin<any> } = await import(`../plugins/${plugin}`)

                if (!plug.default.enable) {
                    continue
                } else {
                    client.on(plug.default.events.event, plug.default.events.run)
                    console.log(`Plugin: ${plug.default.name} loaded!`)
                }
            } catch (e) {
                console.error(`Failed to load plugin!`, e)
                continue
            }
        }

        this.on("ready", () => {
            console.log(`Logged as ${this.user.username}#${this.user.discriminator}!`)
        })
    }
}

export const client = new Mov()

if (!process.env.SERVER_ID) throw new Error("The env SERVER_ID is undefined")