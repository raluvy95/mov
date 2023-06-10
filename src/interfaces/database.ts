import { Modules } from "./module";

export interface ISettingsDB {
    /* Bot's prefix, not server smh */
    prefix: string;
    modules: Modules;
}

interface UserAlias {
    commandTarget: string;
    alias: string[];
}

export interface IUserDB {
    prefix: string;
    colorAccent: string;
    aliases: UserAlias[];
    noMentionOnLevelUP: boolean;
    useLegacyRank: boolean;
    customBackgroundURL?: string;
}

export interface ILevelDB {
    xp: number;
    level: number;
    totalxp: number;
}
