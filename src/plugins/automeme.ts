// import { client } from "../client/Client";
import { client } from "../client/Client";
import { MovPlugin } from "../client/Plugin";
import { ISettingsDB } from "../interfaces/database";
import { debug } from "../utils/debug";
import { pick } from "../utils/math";
import { getSubreddit, parseToEmbed } from "../utils/reddit";
import { summonWebhook } from "../utils/summonWebhook";

export default new MovPlugin("AutoMeme", {
    event: "ready",
    async run() {
        setInterval(async () => {
            const database = await client.database.settings.get<ISettingsDB>(
                process.env.SERVER_ID!,
            );
            if (!database?.modules.autopost.enable) return;

            const auto = database.modules.autopost;
            if (!auto.instances) return;

            for (const instance of auto.instances) {
                const subreddit = instance.subreddits;
                const picked = pick(subreddit);

                try {
                    const channel = client.getChannel(instance.channelId);
                    const fetchAPI = await getSubreddit(picked, {
                        limit: 25,
                        mediaOnly: true,
                        noNSFW: "nsfw" in channel ? !channel.nsfw : true,
                    });

                    if (fetchAPI.length < 1) {
                        debug("Empty result");
                        return;
                    }

                    const postPicked = pick(fetchAPI);
                    const e = parseToEmbed(postPicked);
                    await summonWebhook(instance.channelId, {
                        ...e.build(),
                        username: instance.name,
                        avatarURL: client.user.avatarURL,
                    });
                } catch (e) {
                    console.error(e);
                    return;
                }
            }
        }, 1000 * 60 * 60 * 4);
    },
});
