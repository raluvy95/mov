import { IQuickDBOptions, QuickDB } from 'quick.db';

export class MovDB extends QuickDB {
    constructor(table: string, opt?: IQuickDBOptions) {
        super({
            table: table,
            filePath: '.MOV.sqlite',
            ...opt
        })
    }
}


export class SettingsDB extends MovDB {
    private guildID: string
    constructor(guildID: string) {
        super("serversettings")
        this.guildID = guildID;
        this.init()
    }

    private async init() {
        if (!await this.has(this.guildID)) {
            console.log("Setting up default config for first time")
            await this.set(this.guildID, {
                prefix: "$",
                modules: {
                    welcome: {
                        enable: false,
                        channelId: "channel ID",
                        message: "Welcome {mention} to the server!",
                        ignoreBot: false
                    },
                    goodbye: {
                        enable: false,
                        channelId: "channel ID",
                        message: "Goodbye {user}!",
                        ignoreBot: false
                    },
                    bump: {
                        enable: true,
                        roleId: "0"
                    },
                    rss: {
                        enable: false,
                        instances: [
                            {
                                url: "URL",
                                channelId: "new instance"
                            }
                        ]
                    },
                    level: {
                        enable: true,
                        lvlUp: {
                            channelId: "0",
                        },
                        roleRewards: [],
                        ignoreChannel: [],
                        excludeRole: [],
                        maxXP: 25,
                        minXP: 15,
                        multiplyXP: 1
                    }
                }
            })
        }
    }
}

export class LevelDB extends MovDB {
    constructor() {
        super("level")
    }
}

export class UserDB extends MovDB {
    constructor() {
        super("usersettings")
    }
}

export class CmdStatDB extends MovDB {
    constructor() {
        super("cmdstats")
    }
}