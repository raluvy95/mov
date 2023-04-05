import { client } from "../client/Client";
import { MovPlugin } from "../client/Plugin";
import { ISettingsDB } from "../interfaces/database";
import { dateToString } from "../utils/dateToString";

export default new MovPlugin("clock", {
    event: "ready",
    async run() {
        setInterval(async () => {
            const settings = await client.database.settings.get<ISettingsDB>(process.env.SERVER_ID!)
            if (!settings || !settings.modules.clock.enable) return;
            const clock = settings.modules.clock
            if (!clock.channelId) return
            const channel = client.getChannel(clock.channelId)
            const date = new Date()
            let emoji: string = ''
            switch (date.toLocaleTimeString('en-us').split(':')[0]) {
                case "1":
                    emoji = '🕐'
                    break
                case "2":
                    emoji = '🕑'
                    break
                case "3":
                    emoji = '🕒'
                    break
                case "4":
                    emoji = '🕓'
                    break
                case "5":
                    emoji = '🕔'
                    break
                case "6":
                    emoji = '🕕'
                    break
                case "7":
                    emoji = '🕖'
                    break
                case "8":
                    emoji = '🕗'
                    break
                case "9":
                    emoji = '🕘'
                    break
                case "10":
                    emoji = '🕙'
                    break
                case "11":
                    emoji = '🕚'
                    break
                case "0":
                case "12":
                    emoji = '🕛'
                    break
            }
            if ('edit' in channel) {
                channel.edit({
                    name: `${emoji} | ${dateToString(new Date(), { clockOnly: true, includesTimezone: true, timezone: clock.timezone })}`
                })
            }
        }, 1000 * 60 * 60)
    }
})