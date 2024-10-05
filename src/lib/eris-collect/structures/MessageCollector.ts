import Collector, { CollectorOptions } from './Collector'
import * as Eris from 'eris'

export type MessageCollectorEndReasons = 'guildDelete' | 'channelDelete' | 'threadDelete';

export class MessageCollector<T extends Eris.TextChannel> extends Collector<Eris.Message<T>, MessageCollectorEndReasons> {
    /**
     * @param client The Eris client to apply the collector on.
     * @param channel The channel to collect messages
     * @param options The collector options.
     */
    public constructor(private client: Eris.Client, private channel: T, public options: CollectorOptions<Eris.Message<T>> = {}) {
        super(options)

        const bulkDeleteListener = (messages: Eris.PossiblyUncachedMessage[]): void => {
            for (const message of messages.values()) this.handleDispose(message)
        }

        this.handleChannelDeletion = this.handleChannelDeletion.bind(this)
        this.handleThreadDeletion = this.handleThreadDeletion.bind(this)
        this.handleGuildDeletion = this.handleGuildDeletion.bind(this)

        this.client.on('messageCreate', this.handleCollect)
        this.client.on('messageDelete', this.handleDispose)
        this.client.on('messageDeleteBulk', bulkDeleteListener)
        this.client.on('channelDelete', this.handleChannelDeletion)
        this.client.on('threadDelete', this.handleThreadDeletion)
        this.client.on('guildDelete', this.handleGuildDeletion)

        this.once('end', () => {
            this.client.removeListener('messageCreate', this.handleCollect)
            this.client.removeListener('messageDelete', this.handleDispose)
            this.client.removeListener('messageDeleteBulk', bulkDeleteListener)
            this.client.removeListener('channelDelete', this.handleChannelDeletion)
            this.client.removeListener('threadDelete', this.handleThreadDeletion)
            this.client.removeListener('guildDelete', this.handleGuildDeletion)
        })
    }

    private handleChannelDeletion(channel: Eris.AnyChannel): void {
        if (channel.id === this.channel.id || (this.channel instanceof Eris.GuildChannel && channel.id === this.channel.parentID)) {
            this.stop('channelDelete')
        }
    }

    private handleGuildDeletion(guild: Eris.Guild | Eris.Uncached): void {
        if (this.channel instanceof Eris.GuildChannel) {
            if (guild.id === this.channel.guild.id) {
                this.stop('guildDelete')
            }
        }
    }

    private handleThreadDeletion(thread: Eris.AnyThreadChannel | Eris.Uncached): void {
        if (thread.id === this.channel.id) {
            this.stop('threadDelete')
        }
    }

    protected collect(message: Eris.Message<T>): Eris.Message<T> | null {
        if (message.channel.id !== this.channel.id) return null

        return message
    }

    protected dispose(message: Eris.PossiblyUncachedMessage): Eris.PossiblyUncachedMessage | null {
        if (message.channel?.id !== this.channel.id) return null

        return message
    }
}

/**
 * Await messages.
 * @param client The Eris client to apply the collector on.
 * @param channel The channel to await messages from.
 * @param options The options to await the messages with.
 */
export function awaitMessages<T extends Eris.TextChannel>(client: Eris.Client, channel: T, options: CollectorOptions<Eris.Message<T>> = {}): Promise<Eris.Message<T>[]> {
    return new Promise<Eris.Message<T>[]>((resolve): void => {
        const collector = new MessageCollector(client, channel, options)

        collector.once('end', (collectedMessages) => {
            resolve(collectedMessages)
        })
    })
}