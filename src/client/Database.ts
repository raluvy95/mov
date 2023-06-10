import { IQuickDBOptions, QuickDB } from "quick.db";
import { DEFAULT_SERVER_SETTINGS } from "../constant/defaultConfig";

export class MovDB extends QuickDB {
    constructor(table: string, opt?: IQuickDBOptions) {
        super({
            table: table,
            filePath: ".MOV.sqlite",
            ...opt,
        });
    }
}

export class SettingsDB extends MovDB {
    private guildID: string;
    constructor(guildID: string) {
        super("serversettings");
        this.guildID = guildID;
        this.init();
    }

    async init() {
        if (!(await this.has(this.guildID))) {
            console.log("Setting up default config for first time");
            await this.set(this.guildID, DEFAULT_SERVER_SETTINGS);
        }
    }
}

export class LevelDB extends MovDB {
    constructor() {
        super("level");
    }
}

export class UserDB extends MovDB {
    constructor() {
        super("usersettings");
    }
}

export class CmdStatDB extends MovDB {
    constructor() {
        super("cmdstats");
    }
}
