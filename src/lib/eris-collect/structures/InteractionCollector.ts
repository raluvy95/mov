import Collector, { CollectorOptions } from './Collector'
import { ButtonComponentInteraction, SelectMenuComponentInteraction } from '../types'
import * as Eris from 'eris'

export type ComponentTypes =
    typeof Eris.Constants.ComponentTypes.BUTTON
    | typeof Eris.Constants.ComponentTypes.SELECT_MENU

export type InteractionTypes = typeof Eris.Constants.InteractionTypes.MESSAGE_COMPONENT

export interface MappedComponentTypes {
    [Eris.Constants.ComponentTypes.BUTTON]: ButtonComponentInteraction;
    [Eris.Constants.ComponentTypes.SELECT_MENU]: SelectMenuComponentInteraction;
}


export interface MappedInteractionTypesToComponentTypes {
    [Eris.Constants.InteractionTypes.MESSAGE_COMPONENT]: MappedComponentTypes
}

export interface InteractionCollectorOptions {
    /** The channel to listen to interactions from. */
    channel?: Eris.TextChannel
    /** The guild to listen to interactions from. */
    guild?: Eris.Guild
    /** The interaction response to listen to message component interactions from. */
    interaction?: Eris.AutocompleteInteraction | Eris.CommandInteraction | Eris.ComponentInteraction
    /** The message to listen to interactions from. */
    message?: Eris.Message
}

export type InteractionCollectorOptionsWithGenerics<K extends InteractionTypes, T extends keyof MappedInteractionTypesToComponentTypes[K]> =
    CollectorOptions<MappedInteractionTypesToComponentTypes[K][T]>
    & {
        /** The type of components to listen for. */
        componentType?: T;
        /** The type of interactions to listen for. */
        interactionType?: K;
    }
    & InteractionCollectorOptions

export type InteractionCollectorEndReasons = 'guildDelete' | 'channelDelete' | 'threadDelete' | 'messageDelete';

/** Collects interactions. Will automatically stop if the message, channel, or guild is deleted. */
export class InteractionCollector<K extends InteractionTypes = InteractionTypes, T extends keyof MappedInteractionTypesToComponentTypes[K] = keyof MappedInteractionTypesToComponentTypes[K]> extends Collector<MappedInteractionTypesToComponentTypes[K][T], InteractionCollectorEndReasons> {
    private channel: Eris.TextChannel | Eris.Uncached | null = null
    private componentType: T | null = null
    private guildID: string | null = null
    private interactionType: K | null = null
    private messageID: string | null = null
    private messageInteractionID: string | null = null

    /**
     * @param client The Eris client to apply the collector on.
     * @param options The collector options.
     */
    public constructor(private client: Eris.Client, public options: InteractionCollectorOptionsWithGenerics<K, T> = {}) {
        super(options)

        this.messageID = options.message?.id ?? null
        this.messageInteractionID = options.interaction?.id ?? null
        this.channel = options.interaction?.channel ?? options.message?.channel ?? options.channel ?? null
        this.guildID = options.interaction?.guildID ?? options.message?.guildID ?? options.guild?.id ?? (options.channel instanceof Eris.GuildChannel ? options.channel.guild.id : null)
        this.componentType = options.componentType ?? null
        this.interactionType = options.interactionType ?? null

        const bulkDeleteListener = (messages: Eris.PossiblyUncachedMessage[]): void => {
            if (messages.find((message) => message.id === this.messageID)) this.stop('messageDelete')
        }

        if (this.messageID || this.messageInteractionID) {
            this.handleMessageDeletion = this.handleMessageDeletion.bind(this)
            this.client.on('messageDelete', this.handleMessageDeletion)
            this.client.on('messageDeleteBulk', bulkDeleteListener)
        }

        if (this.channel) {
            this.handleChannelDeletion = this.handleChannelDeletion.bind(this)
            this.handleThreadDeletion = this.handleThreadDeletion.bind(this)
            this.client.on('channelDelete', this.handleChannelDeletion)
            this.client.on('threadDelete', this.handleThreadDeletion)
        }

        if (this.guildID) {
            this.handleGuildDeletion = this.handleGuildDeletion.bind(this)
            this.client.on('guildDelete', this.handleGuildDeletion)
        }

        this.client.on('interactionCreate', this.handleCollect)

        this.once('end', () => {
            this.client.removeListener('interactionCreate', this.handleCollect)
            this.client.removeListener('messageDelete', this.handleMessageDeletion)
            this.client.removeListener('messageDeleteBulk', bulkDeleteListener)
            this.client.removeListener('channelDelete', this.handleChannelDeletion)
            this.client.removeListener('threadDelete', this.handleThreadDeletion)
            this.client.removeListener('guildDelete', this.handleGuildDeletion)
        })
    }

    private handleChannelDeletion(channel: Eris.AnyChannel): void {
        if (channel.id === this.channel?.id || (this.channel instanceof Eris.GuildChannel && channel.id === this.channel.parentID)) {
            this.stop('channelDelete')
        }
    }

    private handleGuildDeletion(guild: Eris.Guild | Eris.Uncached): void {
        if (guild.id === this.guildID) {
            this.stop('guildDelete')
        }
    }

    private handleMessageDeletion(message: Eris.PossiblyUncachedMessage): void {
        if (message.id === this.messageID) {
            this.stop('messageDelete')
        }

        if ('interaction' in message && message.interaction?.id === this.messageInteractionID) {
            this.stop('messageDelete')
        }
    }

    private handleThreadDeletion(thread: Eris.ThreadChannel | Eris.Uncached): void {
        if (thread.id === this.channel?.id) {
            this.stop('threadDelete')
        }
    }

    protected collect(interaction: Eris.AutocompleteInteraction | Eris.CommandInteraction | Eris.ComponentInteraction): Eris.AutocompleteInteraction | Eris.CommandInteraction | Eris.ComponentInteraction | null {
        if (this.interactionType && interaction.type !== this.interactionType) return null
        if (interaction.type === Eris.Constants.InteractionTypes.MESSAGE_COMPONENT) {
            if (this.componentType && interaction.data.component_type !== this.componentType) return null
            if (this.messageID && interaction.message.id !== this.messageID) return null
            if (this.messageInteractionID && interaction.message.interaction?.id !== this.messageInteractionID) return null
        }
        if (this.channel && interaction.channel.id !== this.channel.id) return null
        if (this.guildID && interaction.guildID !== this.guildID) return null

        return interaction
    }

    protected dispose(interaction: Eris.AutocompleteInteraction | Eris.CommandInteraction | Eris.ComponentInteraction): Eris.AutocompleteInteraction | Eris.CommandInteraction | Eris.ComponentInteraction | null {
        if (this.interactionType && interaction.type !== this.interactionType) return null
        if (interaction.type === Eris.Constants.InteractionTypes.MESSAGE_COMPONENT) {
            if (this.componentType && interaction.data.component_type !== this.componentType) return null
            if (this.messageID && interaction.message.id !== this.messageID) return null
            if (this.messageInteractionID && interaction.message.interaction?.id !== this.messageInteractionID) return null
        }
        if (this.channel && interaction.channel.id !== this.channel.id) return null
        if (this.guildID && interaction.guildID !== this.guildID) return null

        return interaction
    }
}

/**
 * Await a component interaction.
 * @param client The Eris client to apply the collector on.
 * @param options The options to await the component interaction with.
 */
export function awaitComponentInteractions<T extends ComponentTypes = ComponentTypes>(client: Eris.Client, options: InteractionCollectorOptionsWithGenerics<typeof Eris.Constants.InteractionTypes.MESSAGE_COMPONENT, T> = {}): Promise<MappedComponentTypes[T] | null> {
    const newOptions = {
        ...options,
        interactionType: Eris.Constants.InteractionTypes.MESSAGE_COMPONENT,
        max: 1
    } as InteractionCollectorOptionsWithGenerics<typeof Eris.Constants.InteractionTypes.MESSAGE_COMPONENT, T>

    return new Promise<MappedComponentTypes[T] | null>((resolve) => {
        const collector = new InteractionCollector(client, newOptions)

        collector.once('end', (collectedInteractions) => {
            const interaction = collectedInteractions[0]

            if (interaction) resolve(interaction)
            else resolve(null)
        })
    })
}