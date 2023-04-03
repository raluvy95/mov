import parse from "rss-to-json";
import { client } from "../client/Client";
import { MovDB } from "../client/Database";
import { MovPlugin } from "../client/Plugin";
import { ISettingsDB } from "../interfaces/database";
import { debug } from "../utils/debug";
import { summonWebhook } from "../utils/summonWebhook";

const cache = new MovDB("cache")

export default new MovPlugin("rss", {
    event: "ready",
    async run() {
        setInterval(async () => {
            const rssdb = await client.database.settings.get<ISettingsDB>(process.env.SERVER_ID!)
            if (!rssdb?.modules.rss.enable) return;

            const rss = rssdb.modules.rss
            if (!rss.instances) return;
            if (rss.instances.length < 1) return;

            for (const instance of rss.instances) {
                for (const url of instance.url) {
                    try {
                        const cached = await cache.get<string>(url)
                        const parsed = await parse(url)
                        const latestContent = parsed.items[0]

                        if (!cached || latestContent.link != cached) {
                            debug(latestContent)
                            const content = !rss.customMsg ? "📰 | {url}" : rss.customMsg
                            await summonWebhook(instance.channelId.toString(), {
                                username: instance.name,
                                content: content.replace("{url}", latestContent.link)
                                    .replace("{title}", latestContent.title)
                            })
                            cache.set(url, latestContent.link)
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }
            }
        }, 60 * 1000 * 25)
    }
})