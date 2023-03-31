export function pick<T>(thing: Array<T>): T {
    return thing[Math.floor(Math.random() * thing.length)]
}