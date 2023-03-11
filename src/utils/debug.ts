import { dateToString } from "./dateToString"

export function debug(...info: any[]) {
    const date = new Date()
    if (process.env.DEBUG) {
        console.debug(`[DEBUG - ${dateToString(date, { includesTimezone: true })}] \x1b[0;30m${info}\x1b[0;0m`)
    }
}