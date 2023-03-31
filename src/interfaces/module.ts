export interface Modules {
    autopost: Partial<{
        enable: boolean,
        instances: {
            name: string,
            channelId: string,
            subreddits: string[]
        }[]
    }>,
    welcome: Partial<{
        enable: boolean
        channelId: string
        message: string
        ignoreBot: boolean
    }>
    goodbye: Partial<{
        enable: boolean
        channelId: string
        message: string
        ignoreBot: boolean
    }>,
    level: Partial<{
        enable: boolean
        lvlup: {
            channelId: string
            message?: string
        }
        roleRewards: {
            ID: string,
            level: number
        }[],
        ignoreChannel: string[]
        excludeRole: string[]
        multiplyXP: number,
        maxXP: number,
        minXP: number
    }>,
    rss: Partial<{
        enable: boolean
        instances: {
            name: string,
            url: string[],
            channelId: string
        }[],
        customMsg?: string
    }>,
    bump: Partial<{
        enable: boolean
        roleID?: string
    }>,
    autopublish: Partial<{
        enable: boolean
    }>,
    messageReference: Partial<{
        enable: boolean
    }>
}