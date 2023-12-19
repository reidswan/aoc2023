import _ from "lodash"
import { readInputGrid, Coord, addCoords, get } from "../utils"
import FastPriorityQueue from "fastpriorityqueue"

export const solve = () => {
    const grid = readInputGrid("input/day17.txt").map(row => row.map(cell => parseInt(cell)))
    console.log("Part 1:", computeMinHeatLoss(grid, 1, 3))
    console.log("Part 2:", computeMinHeatLoss(grid, 4, 10))
}

type QueueEntry = {
    location: Coord,
    heatLoss: number,
    direction: Coord,
}

const computeMinHeatLoss = (grid: number[][], minSteps: number, maxSteps: number): number => {
    const end = { x: grid[0].length - 1, y: grid.length - 1 }
    const queue: FastPriorityQueue<QueueEntry> = new FastPriorityQueue((a, b) => a.heatLoss < b.heatLoss)
    queue.add({ location: { x: 0, y: 0 }, heatLoss: 0, direction: { x: 0, y: 0 } })
    const seen = new Set<string>()

    while (!queue.isEmpty()) {
        const { heatLoss, location, direction } = queue.poll()!
        if (_.isEqual(end, location)) {
            return heatLoss
        }

        const id = [location.y, location.x, direction.y, direction.x].join()
        if (seen.has(id)) {
            continue
        }
        seen.add(id)

        getTurns(direction).forEach(d => {
            let nextLoc = location;
            let loss = heatLoss;
            for (let i = 1; i <= maxSteps; i++) {
                nextLoc = addCoords(nextLoc, d)
                if (!validLocation(grid, nextLoc)) { continue }
                loss += get(grid, nextLoc)!;
                if (i >= minSteps) {
                    queue.add({ location: nextLoc, direction: d, heatLoss: loss })
                }
            }
        })
    }

    throw new Error("never reached target")
}

const allDirections = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }]

const getTurns = ({ x, y }: Coord): Coord[] => {
    return allDirections.filter(({ x: dx, y: dy }) => x * dx === 0 && y * dy === 0)
}

const validLocation = (grid: number[][], { x, y }: Coord): boolean => {
    return 0 <= y && y < grid.length
        && 0 <= x && x < grid[y].length
}
