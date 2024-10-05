import Collector, { CollectorOptions } from './Collector'
import * as Eris from 'eris'

export interface CollectedReaction<T extends Eris.Message> {
    /** The message this reaction is from. */
    message: T;
    /** The reaction collected. */
    reaction: Eris.PartialEmoji;
    /** The user who reacted. */
    user: Eris.Member | Eris.Uncached;
}

export type ReactionCollectorEndReasons = 'guildDelete' | 'channelDelete' | 'threadDelete' | 'messageDelete';

export class ReactionCollector<T extends Eris.Message> extends Collector<CollectedReaction<T>, ReactionCollectorEndReasons> {
    /**
     * @param client The Eris client to apply the collector on.
     * @param message The message to apply collector.
     * @param options The collector options.
     */
    public constructor(private client: Eris.Client, private message: T, public options: CollectorOptions<CollectedReaction<T>> = {}) {
        super(options)

        const bulkDeleteListener = (messages: Eris.PossiblyUncachedMessage[]): void => {
            if (messages.find((message) => message.id === this.message.id)) this.stop('messageDelete')
        }

        this.empty = this.empty.bind(this)
        this.handleChannelDeletion = this.handleChannelDeletion.bind(this)
        this.handleThreadDeletion = this.handleThreadDeletion.bind(this)
        this.handleGuildDeletion = this.handleGuildDeletion.bind(this)
        this.handleMessageDeletion = this.handleMessageDeletion.bind(this)

        this.client.on('messageReactionAdd', this.handleCollect)
        this.client.on('messageReactionRemove', this.handleDispose)
        this.client.on('messageReactionRemoveAll', this.empty)
        this.client.on('messageDelete', this.handleMessageDeletion)
        this.client.on('messageDeleteBulk', bulkDeleteListener)
        this.client.on('channelDelete', this.handleChannelDeletion)
        this.client.on('threadDelete', this.handleThreadDeletion)
        this.client.on('guildDelete', this.handleGuildDeletion)

        this.once('end', () => {
            this.client.removeListener('messageReactionAdd', this.handleCollect)
            this.client.removeListener('messageReactionRemove', this.handleDispose)
            this.client.removeListener('messageReactionRemoveAll', this.empty)
            this.client.removeListener('messageDelete', this.handleMessageDeletion)
            this.client.removeListener('messageDeleteBulk', bulkDeleteListener)
            this.client.removeListener('channelDelete', this.handleChannelDeletion)
            this.client.removeListener('threadDelete', this.handleThreadDeletion)
            this.client.removeListener('guildDelete', this.handleGuildDeletion)
        })
    }

    private handleChannelDeletion(channel: Eris.AnyChannel): void {
        if (channel.id === this.message.channel.id || (this.message.channel instanceof Eris.GuildChannel && channel.id === this.message.channel.parentID)) {
            this.stop('channelDelete')
        }
    }

    private handleGuildDeletion(guild: Eris.Guild | Eris.Uncached): void {
        if (this.message.channel instanceof Eris.GuildChannel) {
            if (guild.id === this.message.guildID) {
                this.stop('guildDelete')
            }
        }
    }

    private handleMessageDeletion(message: Eris.PossiblyUncachedMessage): void {
        if (message.id === this.message.id) {
            this.stop('messageDelete')
        }
    }

    private handleThreadDeletion(thread: Eris.AnyThreadChannel | Eris.Uncached): void {
        if (thread.id === this.message.channel.id) {
            this.stop('threadDelete')
        }
    }

    protected collect(message: T, reaction: Eris.PartialEmoji, user: Eris.Member | Eris.Uncached): CollectedReaction<T> | null {
        if (message.id !== this.message.id) return null

        return {
            reaction,
            message,
            user
        }
    }

    protected dispose(message: T, reaction: Eris.PartialEmoji, userId: string): CollectedReaction<T> | null {
        if (message.id !== this.message.id) return null

        return {
            reaction,
            message,
            user: {
                id: userId
            }
        }
    }
}

/**
 * Await reactions.
 * @param client The Eris client to apply the collector on.
 * @param message The message to await reactions from.
 * @param options The options to await the reactions with.
 */
export function awaitReactions<T extends Eris.Message>(client: Eris.Client, message: T, options: CollectorOptions<CollectedReaction<T>> = {}): Promise<CollectedReaction<T>[]> {
    return new Promise<CollectedReaction<T>[]>((resolve): void => {
        const collector = new ReactionCollector(client, message, options)

        collector.once('end', (collectedReactions) => {
            resolve(collectedReactions)
        })
    })
}