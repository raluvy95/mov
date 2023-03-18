import { Embed, EmbedAuthor, EmbedField, EmbedFooter, EmbedImage, MessageContent } from "eris";
import { COLORS } from "../constant/color";
import { EMBED } from "../constant/globalLimit";

export class MovEmbed implements Embed {
    public author?: EmbedAuthor | undefined;
    public footer?: EmbedFooter | undefined;
    public image?: EmbedImage | undefined;
    public thumbnail?: EmbedImage | undefined;
    public color?: number | COLORS | undefined;
    public description?: string | undefined;
    public fields?: EmbedField[] | undefined;
    public timestamp?: string | Date | undefined;
    public title?: string | undefined;
    public url?: string | undefined;

    // Embeds that don't effect on bot
    public readonly provider = undefined
    public readonly video = undefined;
    public readonly type: string = "rich"

    constructor() {
        this.setTimestamp(new Date())
        this.setColor(COLORS.RANDOM)
        return this
    }

    setTitle(title: string) {
        this.title = title
        return this
    }

    setAuthor(name: string, iconURL?: string, url?: string) {
        if (name.length > EMBED.AUTHOR_NAME) throw new Error(`Reached the limit length allowed (${EMBED.AUTHOR_NAME}`)
        this.author = {
            name,
            icon_url: iconURL,
            url
        }
        return this
    }

    addFields(fields: EmbedField[]) {
        if (!this.fields) {
            this.fields = []
        }
        for (const field of fields) {
            this.fields.push(field)
        }

        if (this.fields.length > EMBED.FIELDS) throw new Error(`Cannot have more than ${EMBED.FIELDS} fields in size`)

        return this
    }

    addField(name: string, value: string, inline?: boolean) {
        if (name.length > EMBED.FIELD_NAME) throw new Error(`Reached the limit length allowed (${EMBED.FIELD_NAME}`)
        if (value.length > EMBED.FIELD_VALUE) throw new Error(`Reached the limit length allowed (${EMBED.FIELD_VALUE}`)

        this.addFields([{ name, value, inline }])
        return this
    }

    setDesc(description: string) {
        if (description.length > EMBED.DESCRIPTION) throw new Error(`Reached the limit length allowed (${EMBED.FIELD_VALUE}`)
        this.description = description
        return this
    }

    setThumb(url: string) {
        this.thumbnail = { url }
        return this
    }

    setImage(url: string) {
        this.image = { url }
        return this
    }

    setURL(url: string) {
        this.url = url
        return this
    }

    setTimestamp(time: string | Date | undefined) {
        this.timestamp = time
        return this
    }

    setColor(color: COLORS | number) {
        if (color == COLORS.RANDOM) {
            color = Math.floor(Math.random() * 16777215)
        }
        this.color = color

        return this
    }

    setFooter(text: string, iconURL?: string) {
        this.footer = {
            text,
            icon_url: iconURL
        }

        return this
    }

    build(): MessageContent {
        return {
            embeds: [this],
        }
    }
}