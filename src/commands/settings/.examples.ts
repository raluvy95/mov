import { Modules } from "../../interfaces/module"

type base = {
    [s in keyof Modules]: string
}

export const EXAMPLE: base = {
    welcome: `
set channelId "1234567890123"
set message Hey {mention}! Welcome to the {server}! We now have {memberCount} members!
set ignoreBot true`,
    goodbye: `
set channelId "1234567890123"
set message Hey {name}! Welcome to the {server}! We now have {memberCount} members!
set ignoreBot true`,
    level: `
set lvlUp.channelId "1234567890123" (or set to "0" to send in a channel where the user was sent)
set lvlUp.message {mention} reached level **{level}**!
add roleRewards {"ID": "1234567890123", "level": 5}
add ignoreChannel "1234567890123"
add excludeRole "1234567890123"
set multiplyXP 2
set maxXP 50
set minXP 30`,
    rss: `
add instances {"name": "New instance", "url": "https://url.to.rss", "channelId": "1234567890123"}
set customMsg New news just dropped! {link}`,
    bump: `
set roleID 1234567890123`
}

export const VARIABLES: base = {
    welcome: `
    \`{mention}\` - member's mention
    \`{name}\` - member's name,
    \`{server}\` - this server's name
    \`{memberCount}\` - this server's member count
    `,
    goodbye: `
    \`{name}\` - member's name,
    \`{server}\` - this server's name
    \`{memberCount}\` - this server's member count
    `,
    level: `
    \`{level}\` - member's level that just reached
    \`{mention}\` - member's mention (unmentionable if opt-out by member)
    `,
    rss: `
    \`{title}\` - The RSS' title
    \`{url}\` - Link to RSS article
    `,
    bump: ``
}