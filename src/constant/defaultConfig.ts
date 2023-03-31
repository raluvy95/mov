import { labels } from "@catppuccin/palette";
import { ISettingsDB, IUserDB } from "../interfaces/database";

export const DEFAULT_SERVER_SETTINGS: ISettingsDB = {
    prefix: "$",
    modules: {
        autopost: {
            enable: false,
            instances: [
                {
                    name: "lol",
                    channelId: "12345678234567",
                    subreddits: ["memes", "dankmemes"]
                }
            ]
        },
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
            roleID: "0"
        },
        rss: {
            enable: false,
            instances: [
                {
                    name: "new thing",
                    url: ["URL"],
                    channelId: "12324567890123456"
                }
            ]
        },
        level: {
            enable: true,
            lvlup: {
                channelId: "0",
            },
            roleRewards: [],
            ignoreChannel: [],
            excludeRole: [],
            maxXP: 25,
            minXP: 15,
            multiplyXP: 1
        },
        autopublish: {
            enable: false
        },
        messageReference: {
            enable: true
        }
    }
}

export const DEFAULT_USER_SETTINGS: IUserDB = {
    prefix: "$",
    aliases: [],
    colorAccent: labels.mauve.mocha.hex,
    noMentionOnLevelUP: false,
    customBackgroundURL: "color",
    useLegacyRank: false
}