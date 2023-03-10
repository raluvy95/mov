import { ClientEvents } from "eris";

interface MovPluginEvent<K extends keyof ClientEvents> {
    event: K
    run: (...args: ClientEvents[K]) => any | void | Promise<void>
}

export class MovPlugin<K extends keyof ClientEvents> {
    public name: string;
    public events: MovPluginEvent<K>
    public enable: boolean;

    constructor(name: string, events: MovPluginEvent<K>, enable?: boolean) {
        this.name = name
        this.events = events
        this.enable = typeof enable != "boolean" ? true : enable
    }
}