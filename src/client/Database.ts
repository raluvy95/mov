import { IQuickDBOptions, QuickDB } from 'quick.db';

export class MovDB extends QuickDB {
    constructor(table: string, opt?: IQuickDBOptions) {
        super({
            table: table,
            ...opt
        })
    }
}


export class SettingsDB extends MovDB {
    constructor() {
        super("settings")
    }
}

export class LevelDB extends MovDB {
    constructor() {
        super("level")
    }
}

export class UserDB extends MovDB {
    constructor() {
        super("serversettings")
    }
}