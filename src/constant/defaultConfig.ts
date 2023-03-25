import { ISettingsDB } from "../interfaces/database";

export const DEFAULT_SERVER_SETTINGS: ISettingsDB = {
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
            roleID: "0"
        },
        rss: {
            enable: false,
            instances: [
                {
                    name: "new thing",
                    url: "URL",
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
        }
    }
}