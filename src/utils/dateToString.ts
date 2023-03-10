function zero(numb: number): string {
    let str = numb.toString()
    if (str.length == 1) {
        str = "0" + str
    }
    return str
}

export function dateToString(date: Date, opts?: { clockOnly?: boolean, includesTimezone?: boolean, timezone?: string }): string {
    date = new Date(date.toLocaleString('en', { timeZone: opts?.timezone }))
    return `${opts?.clockOnly ? '' : date.toDateString() + ' '}${date.getHours()}:${zero(date.getMinutes())}${!opts?.clockOnly ? ":" + zero(date.getSeconds()) : ''}${opts?.includesTimezone ? ' (' + date.toLocaleTimeString('en-us', { timeZoneName: 'short', timeZone: opts.timezone }).split(' ')[2] + ')' : ''}`
}