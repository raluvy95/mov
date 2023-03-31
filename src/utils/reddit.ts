import fetch from "node-fetch";
import { MovEmbed } from "../client/Embed";
import { Data2, Root } from "../interfaces/reddit";

export async function getSubreddit(subreddit: string, opt: {
    limit?: number,
    includeStickied?: boolean,
    noNSFW?: boolean,
    mediaOnly?: boolean
} = { limit: 10, includeStickied: false, noNSFW: true, mediaOnly: false }) {
    const anyContent = await fetch(`https://reddit.com/r/${subreddit}.json?limit=${opt.limit}`).then(r => r.json())
    if (anyContent.error) {
        throw new Error(`${anyContent.error}: ${anyContent.message}`)
    }
    const data = (anyContent as Root).data.children.map(m => m.data)
    if (opt.includeStickied) {
        return data.filter(m => !m.stickied)
    }
    if (opt.noNSFW) {
        return data.filter(m => !m.over_18)
    }
    if (opt.mediaOnly) {
        return data.filter(m => !!m.url.match(/.*(\.jp(e?)g$|\.png$|\.gif$)/g))
    }
    return data
}

export function parseToEmbed(children: Data2) {
    const realUTC = children.created * 1000
    const source = "https://reddit.com/" + children.permalink

    const e = new MovEmbed()
        .setTitle(`${children.title}`)
        .setFooter(`u/${children.author} | r/${children.subreddit}`)
        .setURL(source)
        .setTimestamp(new Date(realUTC))

    if (children.selftext.length > 0) {
        e.setDesc(children.selftext.length >= 2000 ? children.selftext.slice(0, 2000) + `\n[view more](${source})` : children.selftext)
    }
    if (!children.url.match(/.*(\.jp(e?)g$|\.png$|\.gif$)/g)) {
        e.setThumb(children.thumbnail)
    } else {
        e.setImage(children.url)
    }
    if (children.media_metadata) {
        e.setImage(Object.values(children.media_metadata)[0].p[0].u)
    }

    return e.build()
}