export function microsecToString(ms: number) {
    const sec = ms / 1000
    const min = sec / 60
    const hour = min / 60
    const day = hour / 24
    return `${day >= 1 ? day.toFixed() + ' days ' : ''}${hour >= 1 ? hour.toFixed() + ":" : ''}${min >= 1 ? min.toFixed() : 0}:${sec % 60}`
}