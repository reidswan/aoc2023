import fs from "fs"
import _ from "lodash";

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

export class Set<T> {
    set: { [key: string]: T }
    hash: (it: T) => string

    constructor(hash?: (it: T) => string) {
        this.set = {}
        if (hash) {
            this.hash = hash
        } else {
            this.hash = JSON.stringify
        }
    }

    add(t: T) {
        this.set[this.hash(t)] = t
    }

    has(t: T): boolean {
        return this.set[this.hash(t)] !== undefined
    }

    clear() {
        this.set = {}
    }

    remove(t: T): boolean {
        if (this.has(t)) {
            delete this.set[this.hash(t)]
            return true
        }

        return false
    }

    count(): number {
        return this.values().length
    }

    values(): T[] {
        return _.values(this.set)
    }
}

export class Map<K, V> {
    _map: { [key: string]: [K, V] }
    hash: (it: K) => string

    constructor(hash?: (it: K) => string) {
        this._map = {}
        if (hash) {
            this.hash = hash
        } else {
            this.hash = JSON.stringify
        }
    }

    add(k: K, v: V) {
        this._map[this.hash(k)] = [k, v]
    }

    has(k: K): boolean {
        return this._map[this.hash(k)] !== undefined
    }

    clear() {
        this._map = {}
    }

    remove(k: K): boolean {
        if (this.has(k)) {
            delete this._map[this.hash(k)]
            return true
        }

        return false
    }

    count(): number {
        return this.items().length
    }

    items(): [K, V][] {
        return _.values(this._map)
    }

    keys(): K[] {
        return this.items().map(([k]) => k)
    }

    values(): V[] {
        return this.items().map(([, v]) => v)
    }

    get(k: K): V | undefined {
        return this._map[this.hash(k)][1]
    }
}

export const cachedFn = <Args extends unknown[], Result>(fn: (...args: Args) => Result): (...args: Args) => Result => {
    const cache = new Map<Args, Result>();
    return (...args: Args): Result => {
        if (cache.has(args)) {
            return cache.get(args)!
        }

        const result = fn(...args)
        cache.add(args, result)
        return result
    }
}
