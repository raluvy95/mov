import { dateToString } from "./dateToString"

export function debug(...info: any[]) {
    const date = new Date()
    if (process.env.DEBUG) {
        console.debug(`[DEBUG - ${dateToString(date, { includesTimezone: true })}] \x1b[0;30m`)
        console.debug(info)
        console.debug('\x1b[0;0m')
    }
}