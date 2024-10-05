import * as Eris from 'eris'

export type ButtonComponentInteraction<V extends Eris.TextChannel | Eris.Uncached = Eris.TextChannel | Eris.Uncached> = Eris.ComponentInteraction<V> & {
    data: Eris.ComponentInteractionButtonData
}

export type SelectMenuComponentInteraction<V extends Eris.TextChannel | Eris.Uncached = Eris.TextChannel | Eris.Uncached> = Eris.ComponentInteraction<V> & {
    data: Eris.ComponentInteractionSelectMenuData
}