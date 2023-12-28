import { readInputLines } from "../utils"
import _ from "lodash"

export const solve = () => {
    const bricks = parseInput(readInputLines("input/day22.txt"))
    const stack = makeStack(bricks)
    console.log("Part 1:", countDisintegratable(stack))
    console.log("Part 2:", countChainReactions(stack))
}

type Coord3 = { x: number, y: number, z: number }

type Brick = {
    id: number,
    start: Coord3,
    end: Coord3,
}

const parseInput = (src: string[]): Brick[] => {
    const blocks = src.map((line, id) => {
        const [startS, endS] = line.trim().split("~")
        const start = parseCoord(startS)
        const end = parseCoord(endS)
        if (start.z > end.z) {
            return { id, end: start, start: end }
        }
        return { id, start, end }
    })

    blocks.sort((b1, b2) => b1.start.z - b2.start.z)

    return blocks
}

const parseCoord = (s: string): Coord3 => {
    const [x, y, z] = s.split(",").map(it => parseInt(it))

    return { x, y, z }
}

type NumDict<T> = { [key: number]: T }

type BrickStack = {
    supports: NumDict<number[]>,
    supportedBy: NumDict<number[]>
    stack: Brick[][],
}

const makeStack = (bricks: Brick[]): BrickStack => {
    const bricksByZ: Brick[][] = []
    const supports: NumDict<number[]> = {}
    const supportedBy: NumDict<number[]> = {}

    for (const brick of bricks) {
        supports[brick.id] = []

        let height = brick.start.z
        while (height > 1) {
            const bricksBelow = bricksByZ[height - 1]
            if (bricksBelow !== undefined) {
                const overlaps = bricksBelow.filter(b => hasXYOverlap(b, brick))
                if (overlaps.length > 0) {
                    supportedBy[brick.id] = overlaps.map(b => b.id)
                    overlaps.forEach(b => supports[b.id].push(brick.id))
                    break
                }
            }
            height--
        }

        for (let currHeight = height; currHeight <= height + brick.end.z - brick.start.z; currHeight++) {
            if (bricksByZ[currHeight] === undefined) {
                bricksByZ[currHeight] = []
            }

            bricksByZ[currHeight].push({
                id: brick.id,
                start: { ...brick.start, z: height },
                end: { ...brick.end, z: height + (brick.end.z - brick.start.z) }
            })
        }
    }

    return { supports, supportedBy, stack: bricksByZ }
}

const hasXYOverlap = (b1: Brick, b2: Brick): boolean => {
    const [b1StartX, b1EndX] = [b1.start.x, b1.end.x].sort()
    const [b2StartX, b2EndX] = [b2.start.x, b2.end.x].sort()

    const [b1StartY, b1EndY] = [b1.start.y, b1.end.y].sort()
    const [b2StartY, b2EndY] = [b2.start.y, b2.end.y].sort()

    return overlap(b1StartX, b1EndX, b2StartX, b2EndX) &&
        overlap(b1StartY, b1EndY, b2StartY, b2EndY)
}

const overlap = (start1: number, end1: number, start2: number, end2: number): boolean => {
    return start1 <= end2 && start2 <= end1
}

const countDisintegratable = ({ supports, supportedBy }: BrickStack): number => {
    return _.values(supports)
        .filter(supportedBricks => supportedBricks.every(it => supportedBy[it].length > 1))
        .length
}

const countChainReactions = ({ supports, supportedBy, stack }: BrickStack) => {
    let sum = 0
    const seen = new Set<number>();

    stack.reverse().forEach(row => {
        row.forEach(brick => {
            if (seen.has(brick.id)) return
            seen.add(brick.id);

            const fallen = new Set<number>([brick.id]);
            const queue = [brick.id]

            while (queue.length) {
                const next = queue.shift()!;
                const falling = supports[next].filter(supported => supportedBy[supported].filter(it => !fallen.has(it)).length === 0)
                queue.push(...falling);
                falling.forEach(ff => fallen.add(ff));
            }

            sum += fallen.size - 1
        })
    })

    return sum
}
