import { DateTime } from "luxon";
import fetch from "node-fetch";
import { MovEmbed } from "../client/Embed";
import { Data2, Root } from "../interfaces/reddit";

export async function getSubreddit(
    subreddit: string,
    opt: {
        limit?: number;
        includeStickied?: boolean;
        noNSFW?: boolean;
        mediaOnly?: boolean;
    } = { limit: 10, includeStickied: false, noNSFW: true, mediaOnly: false },
) {
    const now = DateTime.now().toMillis();
    const RedditStrikeTime = DateTime.fromISO(
        "2023-06-12T01:00:00.123",
    ).toMillis();
    if (now >= RedditStrikeTime) {
        throw new Error(
            "Reddit API is not longer avaliable due to strike - https://www.reddit.com/r/Save3rdPartyApps/comments/13yh0jf/dont_let_reddit_kill_3rd_party_apps/",
        );
    }
    const anyContent = await fetch(
        `https://reddit.com/r/${encodeURIComponent(subreddit)}.json?limit=${
            opt.limit
        }`,
    ).then((r) => r.json());
    if (anyContent.error) {
        throw new Error(`${anyContent.error}: ${anyContent.message}`);
    }
    let data = (anyContent as Root).data.children.map((m) => m.data);
    if (!opt.includeStickied) {
        data = data.filter((m) => !m.stickied);
    }
    if (opt.noNSFW) {
        data = data.filter((m) => !m.over_18);
    }
    if (opt.mediaOnly) {
        data = data.filter(
            (m) => !!m.url.match(/.*(\.jp(e?)g$|\.png$|\.gif$)/g),
        );
    }
    return data;
}

export function parseToEmbed(children: Data2) {
    const realUTC = (children.created || children.created_utc) * 1000;
    const source = `https://reddit.com${children.permalink}`;

    const e = new MovEmbed()
        .setTitle(`${children.title.slice(0, 255)}`)
        .setFooter(`u/${children.author} | r/${children.subreddit}`)
        .setURL(source)
        .setTimestamp(new Date(realUTC));

    if (children.selftext.length > 0) {
        e.setDesc(
            children.selftext.length >= 2000
                ? `${children.selftext.slice(0, 2000)}\n[view more](${source})`
                : children.selftext,
        );
    }
    if (
        !children.url.match(/http(s)?:\/\/.*(\.jpe?g$|\.png$|\.gif$)/g) &&
        children.thumbnail.startsWith("http")
    ) {
        e.setThumb(children.thumbnail);
    } else {
        e.setImage(children.url);
    }
    if (children.media_metadata) {
        e.setImage(Object.values(children.media_metadata)[0].p[0].u);
    }

    if (children.is_video) {
        e.setDesc(`[Click to see video](${children.url})`);
    }

    return e;
}
