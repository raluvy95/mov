type ID = string | number

export interface Modules {
    welcome: Partial<{
        enable: boolean
        channelId: ID
        message: string
        ignoreBot: boolean
    }>
    goodbye: Partial<{
        enable: boolean
        channelId: ID
        message: string
        ignoreBot: boolean
    }>,
    level: Partial<{
        enable: boolean
        lvlup: {
            channelId: ID
            message?: string
        }
        roleRewards: {
            ID: ID,
            level: number
        }[],
        ignoreChannel: ID[]
        excludeRole: ID[]
        multiplyXP: number,
        maxXP: number,
        minXP: number
    }>,
    rss: Partial<{
        enable: boolean
        instances: {
            name: string,
            url: string,
            channelId: string | number
        }[],
        customMsg?: string
    }>,
    bump: Partial<{
        enable: boolean
        roleID?: string | number
    }>
}