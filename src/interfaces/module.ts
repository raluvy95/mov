
export interface Modules {
    welcome: Partial<{
        enable: true
        channelId: string
        message: string
        ignoreBot: boolean
    }>
    goodbye: Partial<{
        enable: true
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
            url: string,
            channelId: string
        }[],
        customMsg?: string
    }>,
    bump: Partial<{
        enable: true
        roleID?: string
    }>
}