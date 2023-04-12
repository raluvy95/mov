export function pick<T>(thing: Array<T>): T {
    return thing[Math.floor(Math.random() * thing.length)]
}

export function probability(chance: number): boolean {
    return Math.floor(Math.random() * 100) <= chance
}