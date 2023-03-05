export interface ISettingsDB {
    /* Bot's prefix, not server smh */
    prefix: string
    modules: {
        greeting: {
            welcome: {
                /*
                    {mention} - mention of user
                    {user} - user's username
                    {server} - server's name
                    {membercount} - server's member count
                */
                enable: boolean
                channelId: string
                message: string
                ignoreBot: boolean
            },
            goodbye: {
                /*
                    {user} - user's username
                    {server} - server's name
                    {membercount} - server's member count
                */
                enable: boolean
                channelId: string
                message: string
                ignoreBot: boolean
            },
        }
        level: {
            enable: boolean
            lvlup: {
                channelId: string
                /*
                  {mention} - mention of user
                  {user} - user's username
                  {level} - user's level
                */
                message?: string
            }
            roleRewards: {
                ID: string,
                level: number
            }[]
        },
        rss: {
            enable: boolean
            instances: {
                url: string,
                channelId: string
            }[],
            customMsg?: string
        },
        bump: {
            enable: boolean
            roleID?: string
        }
    }
}

export interface IUserDB {
    prefix: string
    aliases: [
        { commandTarget: string, alias: string[] }
    ]
}

export interface ILevelDB {
    xp: number,
    level: number
    totalxp: number
}