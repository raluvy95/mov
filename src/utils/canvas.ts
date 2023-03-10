import { Canvas, CanvasRenderingContext2D, createCanvas, Image } from "canvas";
import { labels } from "@catppuccin/palette";
import { User } from "eris";
import { ILevelDB, IUserDB } from "../interfaces/database";
import { client } from "../client/Client";

async function getUserPref(id: string): Promise<IUserDB> {
    const user = await client.database.user.get<IUserDB>(id)
    if (!user) {
        return {
            prefix: "$",
            rankLayout: "mov",
            aliases: [],
            colorAccent: labels.mauve.mocha.hex,
            customBackgroundURL: undefined
        }
    }
    return user
}

async function genAvatar(ctx: CanvasRenderingContext2D, url: string, x: number, y: number, round?: boolean): Promise<void> {
    if (round) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(x * 1.8, y * 1.8, 40, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
    }

    let img = new Image()
    // @ts-ignore
    await new Promise(r => img.onload = r, img.src = url);

    ctx.drawImage(img, x, y, 80, 80)

    if (round) {
        ctx.beginPath()
        ctx.arc(x * 1.8, y * 1.8, 40, 0, Math.PI * 2)
        ctx.clip()
        ctx.closePath()
        ctx.restore()
    }
}

async function generateBg(canvas: Canvas, ctx: CanvasRenderingContext2D, user: User): Promise<void> {
    const { customBackgroundURL } = await getUserPref(user.id)
    if (!customBackgroundURL && !user.dynamicBannerURL("png")) {
        ctx.fillStyle = labels.crust.mocha.hex
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
        let img = new Image()
        const url = customBackgroundURL || user.dynamicBannerURL("png")
        // @ts-ignore
        await new Promise(r => img.onload = r, img.src = url);
        ctx.drawImage(img, 0, 0)
    }
}

async function movLayout(canvas: Canvas, ctx: CanvasRenderingContext2D, user: User, level: ILevelDB): Promise<void> {
    // background
    ctx.fillStyle = labels.base.mocha.hex
    ctx.roundRect(20, 10, canvas.width - 40, canvas.height - 20, 10)
    ctx.fill()

    const name = `${user.username}#${user.discriminator}`

    const { colorAccent } = await getUserPref(user.id)

    await genAvatar(ctx, user.dynamicAvatarURL("png"), 50, 50, true)

    ctx.font = "16px 'Arial Black'"
    ctx.fillStyle = labels.text.mocha.hex
    const px = ctx.measureText(name)
    ctx.fillText(name, canvas.width / 2 - px.width / 2, canvas.height - 20)
    ctx.fillStyle = colorAccent
    ctx.fillText("level " + level.level.toString(), 20, 50)
}

export async function genXPRank(user: User, level: ILevelDB): Promise<Buffer> {
    const canvas = createCanvas(350, 155)
    const ctx = canvas.getContext("2d")

    await generateBg(canvas, ctx, user)

    await movLayout(canvas, ctx, user, level)

    return canvas.toBuffer()
}