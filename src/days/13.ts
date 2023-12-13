import _ from "lodash"
import { filterMap, readInput } from "../utils"

export const solve = () => {
    const input = readInput("input/day13.txt")
    const patterns = parseInput(input)
    const total = patterns.map(p => countFromReflection(p, findReflectionInHashes)).reduce(_.add)
    console.log("Part 1:", total)

    const totalWithSmudge = patterns.map(p => countFromReflection(p, findReflectionInHashesWithSmudge)).reduce(_.add)
    console.log("Part 2:", totalWithSmudge)
}

type Pattern = {
    src: string[]
    rowHashes: number[]
    columnHashes: number[]
}

const parseInput = (src: string): Pattern[] => {
    return src.split("\n\n").filter(it => it.length).map(parsePattern)
}

const parsePattern = (src: string): Pattern => {
    const rows = src.split("\n")
    const grid = rows.map(row => row.split(""))
    const rowHashes = rows.map(row => row.split("")).map(hash)
    const columnHashes = _.range(grid[0]?.length || 0).map(i => grid.map(g => g[i])).map(hash)

    return {
        src: rows,
        rowHashes,
        columnHashes
    }
}

const hash = (s: string[]): number => {
    return s.map((it, i) => it === "#" ? 1 << i : 0).reduce(_.add, 0)
}

const countFromReflection = (pattern: Pattern, findReflection: (hashes: number[]) => number | undefined): number => {
    let found;

    found = findReflection(pattern.rowHashes)
    if (found) {
        const reflectionPoint = Math.ceil(found / 2)
        return 100 * reflectionPoint
    }

    found = findReflection(pattern.columnHashes)
    if (found) {
        const reflectionPoint = Math.ceil(found / 2)
        return reflectionPoint
    }

    found = findReflection([...pattern.rowHashes].reverse())
    if (found) {
        const reflectionPoint = pattern.rowHashes.length - Math.floor(found / 2) - 1
        return 100 * reflectionPoint
    }

    found = findReflection([...pattern.columnHashes].reverse())
    if (found) {
        const reflectionPoint = pattern.columnHashes.length - Math.floor(found / 2) - 1
        return reflectionPoint
    }

    throw new Error("could not find a reflection!")
}

const findReflectionInHashes = (hashes: number[]): number | undefined => {
    // A reflection goes to the edge of the pattern, so find indexes with matching hashes
    if (!hashes.length) return

    const target = hashes[0]
    const matchIndices = filterMap(hashes, (hash, index) => {
        if (hash === target && index !== 0) {
            return index
        }
    })

    return matchIndices.find(index => checkMatch(hashes, 0, index))
}

const findReflectionInHashesWithSmudge = (hashes: number[]): number | undefined => {
    // A reflection goes to the edge of the pattern, so find indexes with matching hashes
    if (!hashes.length) return

    const target = hashes[0]
    const matchIndices = filterMap(hashes, (hash, index) => {
        if (index != 0 && (hash === target || matchesWithSmudge(target, hash))) {
            return index
        }
    })

    return matchIndices.find(index => checkMatchWithSmudge(hashes, 0, index))
}

const matchesWithSmudge = (a: number, b: number): boolean => {
    if (a == b) return false

    // Two numbers differ by a single bit if (a xor b) == 2^n for some n
    // And if x = 2^n, then x = 10000... and x-1 = 01111..., so (x & x-1) == 0
    const xor = a ^ b;
    return (xor & (xor - 1)) === 0
}

const checkMatch = (hashes: number[], upperIndex: number, lowerIndex: number): boolean => {
    // Reflection must be between rows
    if (lowerIndex % 2 === upperIndex % 2) return false

    for (let offset = 0; offset < Math.ceil((lowerIndex - upperIndex) / 2); offset++) {
        if (hashes[upperIndex + offset] !== hashes[lowerIndex - offset]) {
            return false
        }
    }

    return true
}

const checkMatchWithSmudge = (hashes: number[], upperIndex: number, lowerIndex: number): boolean => {
    // Reflection must be between rows
    if (lowerIndex % 2 === upperIndex % 2) return false

    let smudgeFound = false;

    for (let offset = 0; offset < Math.ceil((lowerIndex - upperIndex) / 2); offset++) {
        const upper = hashes[upperIndex + offset]
        const lower = hashes[lowerIndex - offset]
        if (matchesWithSmudge(upper, lower)) {
            if (smudgeFound) {
                // Only want one smudge
                return false
            }
            // Found our smudge
            smudgeFound = true
        } else if (upper !== lower) {
            // Not equal and not a smudge match
            return false
        }
    }

    return smudgeFound
}
