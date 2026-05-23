import parse from "rss-to-json";
import { client } from "../client/Client";
import { MovPlugin } from "../client/Plugin";
import type { ISettingsDB } from "../interfaces/database";
import { summonWebhook } from "../utils/summonWebhook";

export default new MovPlugin("rss", {
    event: "ready",
    async run() {
        setInterval(async () => {
            const rssdb = client.database.settings.get<ISettingsDB>(
                process.env.SERVER_ID!,
            );
            if (!rssdb?.modules.rss.enable) return;

            const rss = rssdb.modules.rss;
            if (!rss.instances || rss.instances.length < 1) return;

            for (const instance of rss.instances) {
                for (const url of instance.url) {
                    try {
                        // encode url to base64url to prevent the DB wrapper from breaking keys into nested JSON objects
                        const cacheKey = Buffer.from(url).toString("base64url");

                        let cached = client.database.cache.get<string[]>(cacheKey);
                        if (!cached || !Array.isArray(cached)) {
                            cached = [];
                        }

                        const parsed = await parse(url);
                        if (!parsed?.items?.length) continue;

                        const latestContent = parsed.items[0];
                        const link = Array.isArray(latestContent.link)
                            ? latestContent.link[0].href
                            : latestContent.link;

                        if (!link) continue;

                        if (!cached.includes(link)) {
                            // push immediately to local reference so current loop cycle tracks it
                            cached.push(link);
                            if (cached.length > 5) cached.shift();

                            // force overwrite the cache DB with a flat key
                            client.database.cache.set(cacheKey, [...cached]);

                            const content = !rss.customMsg
                                ? "📰 | {url}"
                                : rss.customMsg;

                            await summonWebhook(instance.channelId.toString(), {
                                username: instance.name,
                                content: content
                                    .replace("{url}", link)
                                    .replace("{title}", latestContent.title || ""),
                            });
                        }
                    } catch (e) {
                        console.error(`rss plugin error on ${url}:`, e);
                    }
                }
            }
        }, 60 * 1000 * 25);
    },
});