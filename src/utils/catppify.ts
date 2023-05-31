import { CanvasRenderingContext2D, Image, createCanvas, loadImage } from "canvas"
import { readFile } from "fs/promises"

export type Palette = "frappe" | "latte" | "machiatto" | "mocha" | "oled"

export type Noise = "0" | "1" | "2" | "3" | "4"

export async function catppify(url: string, palette: Palette = "mocha", noise: Noise = "4") {
    const _img = await loadImage(url)
    const out_img = createCanvas(_img.width, _img.height)
    const ctx = out_img.getContext("2d")
    ctx.drawImage(_img, 0, 0)
    const clut_path = `./assets/palette/${palette}/noise_${noise}.png`
    let _clut: Image
    let ctxC: CanvasRenderingContext2D
    try {
        _clut = await loadImage(await readFile(clut_path))
        const canv = createCanvas(_clut.width, _clut.height)
        ctxC = canv.getContext('2d')
        ctxC.drawImage(_clut, 0, 0)
    } catch (e) {
        throw e
    }

    for (let x = 0; x < _img.width; x++) {
        for (let y = 0; y < _img.height; y++) {
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

            ctx.fillStyle = `rgba(${out_pixel.join(", ")})`
            ctx.fillRect(x, y, 1, 1)
        }
    }

    return out_img.toBuffer()


}