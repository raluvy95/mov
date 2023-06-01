import { Canvas, loadImage, CanvasRenderingContext2D, Image } from "canvas"
import { readFile } from "fs/promises"

export type Palette = "frappe" | "latte" | "machiatto" | "mocha" | "oled"

export type Noise = "0" | "1" | "2" | "3" | "4"

async function imageProcessing(ctx: CanvasRenderingContext2D, ctxC: CanvasRenderingContext2D, img: Image) {
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let chunk = ctx.getImageData(x, y, 1, 1).data

            const r = chunk[0]
            const g = chunk[1]
            const b = chunk[2]
            const a = chunk[3]

            if (a == 0) continue

            const a_r = Math.floor(r / 4)
            const a_g = Math.floor(g / 4)
            const a_b = Math.floor(b / 4)

            const c_x = (a_r % 64 + (a_g % 8) * 64)
            const c_y = Math.floor(a_b * 8 + a_g / 8)
            const c_pixel = ctxC.getImageData(c_x, c_y, 1, 1).data

            const out_pixel = [...c_pixel, a]
            const fillStyle = `rgba(${out_pixel[0]}, ${out_pixel[1]}, ${out_pixel[2]}, ${(a / 255).toFixed(2)})`
            ctx.fillStyle = fillStyle
            ctx.fillRect(x, y, 1, 1)
        }
    }

    return ctx
}

export async function catppify(url: string, palette: Palette = "mocha", noise: Noise = "4") {
    const _img = await loadImage(url)

    let img = new Canvas(_img.width, _img.height)
    let ctx = img.getContext("2d")
    ctx.drawImage(_img, 0, 0)

    const clut_path = `./assets/palette/${palette}/noise_${noise}.png`
    let _clut: Image
    let ctxC: CanvasRenderingContext2D
    try {
        _clut = await loadImage(await readFile(clut_path))
        const canv = new Canvas(_clut.width, _clut.height)
        ctxC = canv.getContext('2d')
        ctxC.drawImage(_clut, 0, 0)
    } catch (e) {
        throw e
    }

    // needs a way to stop blocking other tasks
    ctx = await imageProcessing(ctx, ctxC, _img)

    return img.toBuffer()
}