import { CommandInteraction } from "eris";
import { client } from "./client/Client";
import { debug } from "./utils/debug";
import { unlinkSync } from "fs";

process.on("unhandledRejection", (rej) => {
    console.error(rej);
});

process.on("uncaughtException", (rej) => {
    console.error(rej);
});

client.on("error", (e) => {
    console.error(e);
});

client.on("debug", (i) => {
    debug(i);
});

try {
    unlinkSync("generated.png");
    unlinkSync("input.png");
} catch { }
client.connect();
