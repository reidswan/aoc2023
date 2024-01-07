import _ from "lodash"
import { readInputLines } from "../utils"

export const solve = () => {
    const input = readInputLines("input/day24.txt").map(parseHailStone)
    console.log("Part 1:", count2dIntersections(input, 200000000000000, 400000000000000))
    const [matrix, targets] = makeMatrices(input)
    const solns = gaussElim(matrix, targets)
    if (!solns) {
        console.log("Could not find solution")
        process.exit(1)
    }

    const [py, vx, vy, px] = solns.map(i => Math.round(i))
    const [pz] = findZ(input, px, vx)
    console.log("Part 2:", px + py + pz)
}

type Coord3 = [number, number, number]

type HailStone = {
    position: Coord3,
    velocity: Coord3,
}

type Line2D = {
    m: number,
    c: number,
}

const parseHailStone = (line: string): HailStone => {
    const [posS, velS] = line.split("@")
    const position = posS.split(",").map(it => parseInt(it.trim()))
    const velocity = velS.split(",").map(it => parseInt(it.trim()))

    if (position.length !== 3) {
        throw new Error(`expected position to have 3 elems but was ${position}`)
    }
    if (velocity.length !== 3) {
        throw new Error(`expected velocity to have 3 elems but was ${velocity}`)
    }

    return { position: position as Coord3, velocity: velocity as Coord3 }
}

const find2dLine = (hailstone: HailStone): Line2D => {
    const x = hailstone.position[0]
    const y = hailstone.position[1]

    const m = hailstone.velocity[1] / hailstone.velocity[0]
    const c = y - m * x

    return { m, c }
}

const findIntersection = (line1: Line2D, line2: Line2D): [number, number] => {
    const x = (line2.c - line1.c) / (line1.m - line2.m)
    const y = line1.m * x + line1.c

    return [x, y]
}

const stepsUntil = (hailstone: HailStone, [x,]: [number, number]): number => {
    return (x - hailstone.position[0]) / hailstone.velocity[0]
}

const count2dIntersections = (hailstones: HailStone[], from: number, to: number): number => {
    const lines = hailstones.map(find2dLine)
    let count = 0
    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            const [x, y] = findIntersection(lines[i], lines[j])
            if (from <= x && x <= to && from <= y && y <= to) {
                const stepsUntilI = stepsUntil(hailstones[i], [x, y])
                const stepsUntilJ = stepsUntil(hailstones[j], [x, y])
                if (stepsUntilI >= 0 && stepsUntilJ >= 0) {
                    count++
                }
            }
        }
    }
    return count
}

const makeRow = (h1: HailStone, h2: HailStone): [number[], number] => {
    const [p1x, p1y,] = h1.position
    const [p2x, p2y,] = h2.position
    const [v1x, v1y,] = h1.velocity
    const [v2x, v2y,] = h2.velocity

    return [
        [p1x - p2x, -(p1y - p2y), v1y - v2y, -(v1x - v2x)],
        p1x * v1y - p2x * v2y + p2y * v2x - p1y * v1x
    ]

}

const makeMatrices = (input: HailStone[]): [number[][], number[]] => {
    const matrix = []
    const targets = []
    for (let i = 1; i <= 4; i++) {
        const [mRow, mTgt] = makeRow(input[i - 1], input[i])
        matrix.push(mRow)
        targets.push(mTgt)
    }

    return [matrix, targets]
}

const toRowEchelon = (matrix: number[][], targets: number[]): number[] | undefined => {
    const swaps = targets.map((_, i) => i)
    for (let i = 0; i < matrix.length; i++) {
        let pivotIndex = i
        let pivot = matrix[i][i]
        for (let j = i + 1; j < matrix.length; j++) {
            if (Math.abs(matrix[j][i]) > Math.abs(pivot)) {
                pivotIndex = j
                pivot = matrix[j][i]
            }
        }

        if (matrix[pivotIndex][i] === 0) {
            return undefined
        }

        swapRow(matrix, i, pivotIndex)
        swap(targets, i, pivotIndex)
        swap(swaps, i, pivotIndex)

        for (let j = i + 1; j < matrix.length; j++) {
            const lam = matrix[j][i] / matrix[i][i]
            for (let k = i + 1; k < matrix.length; k++) {
                matrix[j][k] -= matrix[i][k] * lam
            }
            targets[j] -= targets[i] * lam
            matrix[j][i] = 0
        }
    }

    return swaps
}

const swap = <T>(arr: T[], i: number, j: number) => {
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
}

const swapRow = <T>(arr: T[][], i: number, j: number) => {
    for (let k = 0; k < arr[i].length; k++) {
        const temp = arr[i][k]
        arr[i][k] = arr[j][k]
        arr[j][k] = temp
    }
}

const backsub = (matrix: number[][], targets: number[], swaps: number[]): number[] => {
    const solutions = new Array<number>(targets.length)
    for (let i = matrix.length - 1; i >= 0; i--) {
        solutions[i] = (targets[i] - matrix[i].slice(i + 1).map((mij, j) => mij * solutions[i + j + 1]).reduce(_.add, 0)) / matrix[i][i]
    }

    // Unswap final answers
    for (let i = 0; i < swaps.length; i++) {
        const actualIx = swaps[i]
        if (i === actualIx) continue

        swap(swaps, i, actualIx)
        swap(solutions, i, actualIx)
    }

    return solutions
}

const gaussElim = (matrix: number[][], targets: number[]): number[] | undefined => {
    const swaps = toRowEchelon(matrix, targets)
    if (swaps === undefined) return undefined

    return backsub(matrix, targets, swaps)
}

const findZ = (hailstones: HailStone[], px: number, vx: number): [number, number] => {
    const hi = hailstones[0]
    const hj = hailstones[1]

    const ti = (hi.position[0] - px) / (vx - hi.velocity[0])
    const zi = hi.position[2] + ti * hi.velocity[2]

    const tj = (hj.position[0] - px) / (vx - hj.velocity[0])
    const zj = hj.position[2] + tj * hj.velocity[2]

    const vz = (zi - zj) / (ti - tj)
    return [zi - ti * vz, vz]
}
