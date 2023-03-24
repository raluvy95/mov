import { Webhook, WebhookPayload } from "eris";
import { client } from "../client/Client";

export async function summonWebhook(channelId: string, opts: WebhookPayload) {
    const webhooks = await client.getChannelWebhooks(channelId)
    let webhook: Webhook | undefined
    for (const webhoo of webhooks) {
        if (!webhoo.token) continue;
        webhook = webhoo
        break
    }
    if (!webhook || webhook.token) {
        const newWebhook = await client.createChannelWebhook(channelId, {
            name: "Mov Webhook"
        })

        webhook = newWebhook

        // Impossible to not have token right after created new webhook
        if (!webhook?.token) {
            throw new Error("Rare error has occured.")
        }
    }

    return await client.executeWebhook(webhook.id, webhook.token!, opts)
}