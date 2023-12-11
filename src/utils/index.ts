import fs from "fs"

export const readInput = (path: string): string => {
    return fs.readFileSync(path).toString()
}

export const readInputLines = (path: string): string[] => {
    const contents = readInput(path);

    return contents.split("\n")
}

export const isNumeric = (s: string): boolean => {
    return !!s.match(/[0-9]+/)
}

export const gcd = (a: number, b: number): number => {
    while (b != 0) {
        [a, b] = [b, a % b]
    }

    return a
}

export const leastCommonMultiple = (a: number, b: number): number => {
    return a * b / gcd(a, b)
}

export const filterMap = <T, U>(iter: T[], fn: (item: T, index: number) => U | undefined): U[] => {
    return iter.reduce((acc, item, index) => {
        const res = fn(item, index)
        if (res !== undefined) {
            acc.push(res)
        }
        return acc
    }, [] as U[])
}

export type Coord = {
    x: number,
    y: number
}

export const get = <T>(src: T[][], coord: Coord): T | undefined => {
    const row = src[coord.y]
    if (row !== undefined) {
        return row[coord.x]
    }
}
