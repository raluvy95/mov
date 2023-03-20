import { Connectors, Shoukaku } from "shoukaku"
import { client } from "./Client"

class Lavalink extends Shoukaku {
    constructor() {
        super(new Connectors.Eris(client), [{
            name: "node",
            url: process.env.LAVALINK_HOST! + ":" + process.env.LAVALINK_PORT!,
            auth: process.env.LAVALINK_PASSWORD!
        }])

    }
}

export const lavalink = new Lavalink()