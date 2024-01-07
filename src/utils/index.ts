import fs from "fs"

export const readInput = (path: string): string => {
    return fs.readFileSync(path).toString()
}

export const readInputLines = (path: string): string[] => {
    const contents = readInput(path);

    return contents.split("\n")
}

export const readInputGrid = (path: string): string[][] => {
    return readInputLines(path).map(line => line.split(""))
}

export const isNumeric = (s: string): boolean => {
    return !!s.match(/[0-9]+/)
}

export const gcd = (a: number, b: number): number => {
    a = Math.abs(a)
    b = Math.abs(b)

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

export const addCoords = ({ x: x1, y: y1 }: Coord, { x: x2, y: y2 }: Coord): Coord => {
    return { x: x1 + x2, y: y1 + y2 }
}

export const get = <T>(src: T[][], coord: Coord): T | undefined => {
    const row = src[coord.y]
    if (row !== undefined) {
        return row[coord.x]
    }
}

export class Set<T> {
    set: Map<string | number, T>
    hash: (it: T) => string | number

    constructor(hash?: (it: T) => string | number) {
        this.set = new Map<string | number, T>()
        if (hash) {
            this.hash = hash
        } else {
            this.hash = JSON.stringify
        }
    }

    add(...ts: T[]): Set<T> {
        ts.forEach(t => this.set.set(this.hash(t), t))
        return this
    }

    has(t: T): boolean {
        return this.set.has(this.hash(t))
    }

    clear() {
        this.set = new Map<string | number, T>()
    }

    remove(t: T): boolean {
        if (this.has(t)) {
            this.set.delete(this.hash(t))
            return true
        }

        return false
    }

    count(): number {
        return this.values().length
    }

    values(): T[] {
        return [...this.set.values()]
    }

    clone(): Set<T> {
        const clone = new Set<T>(this.hash)
        clone.set = new Map<string | number, T>(this.set.entries())
        return clone
    }
}

export class Map_<K, V> {
    _map: Map<string | number, [K, V]>
    hash: (it: K) => string | number

    constructor(hash?: (it: K) => string | number) {
        this._map = new Map()
        if (hash) {
            this.hash = hash
        } else {
            this.hash = JSON.stringify
        }
    }

    add(k: K, v: V) {
        this._map.set(this.hash(k), [k, v])
    }

    has(k: K): boolean {
        return this._map.has(this.hash(k))
    }

    clear() {
        this._map = new Map()
    }

    remove(k: K): boolean {
        if (this.has(k)) {
            this._map.delete(this.hash(k))
            return true
        }

        return false
    }

    count(): number {
        return this.items().length
    }

    items(): [K, V][] {
        return [...this._map.values()]
    }

    keys(): K[] {
        return this.items().map(([k]) => k)
    }

    values(): V[] {
        return this.items().map(([, v]) => v)
    }

    get(k: K, defaultV?: V): V | undefined {
        const entry = this._map.get(this.hash(k))
        if (entry) return entry[1]
        else return defaultV
    }
}

export const cachedFn = <Args extends unknown[], Result>(fn: (...args: Args) => Result, key?: (args: Args) => string): (...args: Args) => Result => {
    const cache = new Map_<Args, Result>(key);
    return (...args: Args): Result => {
        if (cache.has(args)) {
            return cache.get(args)!
        }

        const result = fn(...args)
        cache.add(args, result)
        return result
    }
}

export const hashCoord = ({ x, y }: Coord): string => [x, y].join()

export const gcdExt = (a: number, b: number): { gcd: number, x: number, y: number } => {
    if (a === 0) return { gcd: b, x: 0, y: 1 }

    const { gcd, x: x1, y: y1 } = gcdExt(b % a, a)

    const x = y1 - Math.floor(b / a) * x1
    const y = x1

    return { gcd, x, y }
}

export const crt = (remainders: number[], moduli: number[]): number | undefined => {
    if (remainders.length !== moduli.length) {
        throw new Error("mismatch between number of remainders and moduli")
    }

    if (remainders.length === 0) return undefined
    if (remainders.length === 1) return remainders[0]

    // eslint-disable-next-line prefer-const
    let [rAcc, ...rem] = remainders
    // eslint-disable-next-line prefer-const
    let [mAcc, ...mod] = moduli

    while (rem.length) {
        let r = rem.pop()!
        const m = mod.pop()!
        if (r < 0) r += m

        const div = gcd(mAcc, m)
        if (rAcc % div !== r % div) {
            return undefined
        }

        const { x, y } = gcdExt(mAcc / div, m / div)
        const m_ = (mAcc * m / div)
        rAcc = (rAcc * (m / div) * y + r * (mAcc / div) * x) % m_

        if (rAcc < 0) {
            rAcc += m_
        }

        mAcc = m_
    }

    return rAcc % mAcc
}
