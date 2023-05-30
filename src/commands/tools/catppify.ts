import { Message } from "eris";
import { client } from "../../client/Client";
import { MovCommand } from "../../client/Command";
import https from "https";
import { createWriteStream, readFile, unlinkSync } from "fs";
import { spawn } from "child_process";

function mmToDhms(mm: number | string): string {
    mm = Number(mm)
    const seconds = mm / 1000
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);

    const dDisplay = d > 0 ? d + "d " : "";
    const hDisplay = h > 0 ? h + "h" : "";
    const mDisplay = m > 0 ? m + "m " : "";
    const sDisplay = s > 0 ? s + "s" : "";
    const mmDisplay = mm > 0 ? mm + "mm" : '';
    return dDisplay + hDisplay + mDisplay + sDisplay + mmDisplay;
}

function download(url: string, dest: string, cb?: ((err?: NodeJS.ErrnoException | null | undefined) => void) | undefined) {
    const file = createWriteStream(dest);
    https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(cb);
        });
    });
}

function generator(msg: Message, args: string[]) {
    if (process.env.CATPPIFY) {
        let ext = !args[0] ? '' : args[0].split('.').at(-1)
        let link: string = ''
        let palette: string
        let noise: string


        if (args[0]?.startsWith("http://")) {
            client.createMessage(msg.channel.id, "HTTP is not supported. Use HTTPS instead!")
            return
        }

        if (!args[0]?.match('^https:\/\/') && !ext?.match(/(jp(e?)g|png|gif|webp)/gi)) {
            if (msg.attachments.length < 1) {
                client.createMessage(msg.channel.id, "Invalid link")
                return
            }
            link = msg.attachments[0].url
            ext = link.split('.').at(-1)
            palette = args[0]
            noise = args[1]
        } else {
            link = args[0]
            palette = args[1]
            noise = args[2]
        }

        if (!palette) {
            palette = 'mocha'
        } else {
            const avaliable_palette = ['frappe', 'latte', 'macchiato', 'mocha', 'oled']
            if (!avaliable_palette.includes(palette)) {
                client.createMessage(msg.channel.id, `Invalid palette. Use one of the following avaliable palettes: ${avaliable_palette.join(", ")}`)
                return
            }
        }
        if (!noise) {
            noise = '4'
        } else {
            if (isNaN(Number(noise))) {
                client.createMessage(msg.channel.id, `That's not a number lol`)
                return
            }
            const avaliable_noise = ['0', '1', '2', '3', '4']
            if (!avaliable_noise.includes(noise)) {
                client.createMessage(msg.channel.id, `Invalid palette. Use one of the following avaliable noises: ${avaliable_noise.join(", ")}`)
                return
            }
        }
        const init_time = Date.now()
        client.sendChannelTyping(msg.channel.id)
        download(link, `input.${ext}`, () => {
            const process = spawn("python3", ["./bin/catppify", `input.${ext}`, '-p', palette, '-n', noise])

            process.stderr.on('data', (data) => {
                console.log((data as Buffer).toString())
            });

            process.on('exit', (code) => {
                if (code !== 0) {
                    client.createMessage(msg.channel.id, "There's something went wrong. Please contact your developer")
                    return
                }
                readFile("./generated.png", (err, data) => {
                    if (err) {
                        console.error(err)
                        client.createMessage(msg.channel.id, "There's something went wrong. Please contact your developer")
                        return

                    } else {
                        const took = Date.now() - init_time
                        client.createMessage(msg.channel.id, `Here you go (Took ${mmToDhms(took / 1000)})`, {
                            file: data,
                            name: "generated.png"
                        })

                        unlinkSync("generated.png")
                        unlinkSync(`input.${ext}`)
                    }
                })

            })
        })
    } else {
        client.createMessage(msg.channel.id, "Catppify is disabled.")
        return
    }
}

class Catppify extends MovCommand {
    constructor() {
        super("catppify", generator, {
            description: "Generate your image based on Catppuccin theme!",
            usage: "<link or attachment> [palette] [noise]"
        })
    }
}

export default new Catppify();