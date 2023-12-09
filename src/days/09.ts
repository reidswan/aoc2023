import _ from "lodash"
import { readInputLines } from "../utils"

export const solve = () => {
    const sequences = parseInput(readInputLines("input/day09.txt"))
    let result = sequences
        .map(extrapolateSequence((seq, delta) => _.last(seq)! + delta))
        .reduce((acc, it) => acc + it);
    console.log("Part 1:", result)

    result = sequences
        .map(extrapolateSequence((seq, delta) => _.first(seq)! - delta))
        .reduce((acc, it) => acc + it)
    console.log("Part 2:", result)
}

const parseInput = (lines: string[]): number[][] => {
    return lines.map(line => line.split(" ").map(i => parseInt(i)))
}

const extrapolateSequence = (combine: (sequence: number[], delta: number) => number) => (sequence: number[]): number => {
    const d = deltas(sequence)
    if (!d.length) {
        return 0
    }

    let delta;
    if (d.every(it => it === d[0])) {
        delta = d[0]
    } else {
        delta = extrapolateSequence(combine)(d)
    }

    return combine(sequence, delta)
}

const deltas = (sequence: number[]): number[] => {
    const [, ...rest] = sequence

    return _.zip(sequence, rest).map(([a, b]) => {
        if (a === undefined || b === undefined) {
            return undefined
        }
        return b - a
    }).filter(it => it !== undefined) as number[]
}
