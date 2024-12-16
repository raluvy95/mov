import parse from "rss-to-json";
import { client } from "../client/Client";
import { MovDB } from "../client/Database";
import { MovPlugin } from "../client/Plugin";
import { ISettingsDB } from "../interfaces/database";
import { summonWebhook } from "../utils/summonWebhook";

const cache = new MovDB("cache");

export default new MovPlugin("rss", {
    event: "ready",
    async run() {
        setInterval(async () => {
            const rssdb = await client.database.settings.get<ISettingsDB>(
                process.env.SERVER_ID!,
            );
            if (!rssdb?.modules.rss.enable) return;

            const rss = rssdb.modules.rss;
            if (!rss.instances) return;
            if (rss.instances.length < 1) return;

            for (const instance of rss.instances) {
                for (const url of instance.url) {
                    try {
                        var cached = await cache.get<string[]>(url);
                        if (!cached) {
                            cached = [];
                        }
                        const parsed = await parse(url);
                        const latestContent = parsed.items[0];
                        if (Array.isArray(latestContent.link)) {
                            // Atom support
                            latestContent.link = latestContent.link[0].href;
                        }
                        if (!cached.includes(latestContent.link)) {
                            cache.set(url, cached.slice(-3).concat(latestContent.link));
                            const content = !rss.customMsg
                                ? "📰 | {url}"
                                : rss.customMsg;
                            await summonWebhook(instance.channelId.toString(), {
                                username: instance.name,
                                content: content
                                    .replace("{url}", latestContent.link)
                                    .replace("{title}", latestContent.title),
                            });
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }, 60 * 1000 * 25);
    },
});
