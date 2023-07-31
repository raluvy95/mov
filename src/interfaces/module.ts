export interface Modules {
    welcome: Partial<{
        enable: boolean;
        channelId: string;
        message: string;
        ignoreBot: boolean;
    }>;
    goodbye: Partial<{
        enable: boolean;
        channelId: string;
        message: string;
        ignoreBot: boolean;
    }>;
    level: Partial<{
        enable: boolean;
        lvlup: {
            channelId: string;
            message?: string;
        };
        roleRewards: {
            ID: string;
            level: number;
        }[];
        ignoreChannel: string[];
        excludeRole: string[];
        multiplyXP: number;
        maxXP: number;
        minXP: number;
        noReminderToDisablePing: boolean;
    }>;
    rss: Partial<{
        enable: boolean;
        instances: {
            name: string;
            url: string[];
            channelId: string;
        }[];
        customMsg?: string;
    }>;
    bump: Partial<{
        enable: boolean;
        roleID?: string;
        bumpRewards: boolean;
    }>;
    autopublish: Partial<{
        enable: boolean;
    }>;
    messageReference: Partial<{
        enable: boolean;
    }>;
    clock: Partial<{
        enable: boolean;
        timezone: string;
        channelId: string;
    }>;
    autoMessageForum: Partial<{
        enable: boolean;
        message: string;
        mentionable: boolean;
        ignoreChannel?: string[];
    }>;
}
