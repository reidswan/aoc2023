import { readInput, Coord, get, filterMap } from "../utils"

export const solve = () => {
    const input = parseInput(readInput("input/day10.txt"))
    const loop = getLoop(input)
    const start = input.pipes[input.start.y][input.start.x]
    start.pipeType = determineStartType(loop, start)
    const maxDist = findMaxLoopDistance(loop)
    console.log("Part 1:", maxDist)
    const bounded = findBoundedByLoop(input, loop)
    console.log("Part 2:", bounded)
}

type Pipe = {
    pipeType: PipeType,
    coord: Coord,
    connects: Coord[],
}

type PipeMap = {
    start: Coord,
    pipes: Pipe[][]
}

enum PipeType {
    Start = "S",
    Vertical = "|",
    Horizontal = "-",
    NEBend = "L",
    NWBend = "J",
    SWBend = "7",
    SEBend = "F",
    Ground = ".",
}

const parsePipeType = (c: string): PipeType => {
    switch (c) {
        case "|":
            return PipeType.Vertical
        case "-":
            return PipeType.Horizontal
        case "L":
            return PipeType.NEBend
        case "J":
            return PipeType.NWBend
        case "7":
            return PipeType.SWBend
        case "F":
            return PipeType.SEBend
        case "S":
            return PipeType.Start
        case ".":
            return PipeType.Ground
    }
    throw new Error(`unrecognized pipe type: "${c}"`)
}

const getConnections = (p: PipeType, { x, y }: Coord): Coord[] => {
    switch (p) {
        case PipeType.Start:
            return [
                { x: x - 1, y }, { x: x + 1, y },
                { x, y: y - 1 }, { x, y: y + 1 },
            ]
        case PipeType.Vertical:
            return [{ x, y: y - 1 }, { x, y: y + 1 }]
        case PipeType.Horizontal:
            return [{ x: x - 1, y }, { x: x + 1, y }]
        case PipeType.NEBend:
            return [{ x, y: y - 1 }, { x: x + 1, y }]
        case PipeType.NWBend:
            return [{ x, y: y - 1 }, { x: x - 1, y }]
        case PipeType.SWBend:
            return [{ x: x - 1, y }, { x, y: y + 1 }]
        case PipeType.SEBend:
            return [{ x: x + 1, y }, { x, y: y + 1 }]
        case PipeType.Ground:
            return []
    }
}

const parseInput = (input: string): PipeMap => {
    let start = { x: -1, y: -1 } as Coord

    const pipes = input.split("\n").map((line, y) => line.split("").map((c, x) => {
        const pipeType = parsePipeType(c)
        const coord = { x, y }
        if (pipeType === PipeType.Start) {
            start = coord
        }

        return {
            pipeType,
            coord,
            connects: getConnections(pipeType, coord)
        } as Pipe
    }))

    if (start.x == -1 || start.y == -1) {
        throw new Error("could not find start")
    }

    return { pipes, start }
}

const getLoopStartingAt = (pipeMap: PipeMap, start: Coord, next: Coord): Coord[] | undefined => {
    const seen = pipeMap.pipes.map(p => p.map(() => false))
    seen[start.y][start.x] = true
    const loop: Coord[] = [start]

    let prev = start;
    let curr = next;

    while (!get(seen, curr)) {
        const currPipe = get(pipeMap.pipes, curr)
        if (currPipe === undefined || currPipe.connects.length < 2) {
            // No connections - not a loop
            return
        } else if (!currPipe.connects.some(c => c.x == prev.x && c.y == prev.y)) {
            // Does not actually connect to previous pipe - not a loop
            return
        }

        seen[curr.y][curr.x] = true
        loop.push(curr)

        const next = currPipe.connects.filter(c => c.x != prev.x || c.y != prev.y)[0]
        if (next === undefined) {
            // Does not exist - not a loop
            return
        }

        prev = curr
        curr = next
    }

    return loop
}

const getLoop = (pipeMap: PipeMap): Coord[] => {
    const start = get(pipeMap.pipes, pipeMap.start)!;
    return filterMap(start.connects, (next) => getLoopStartingAt(pipeMap, pipeMap.start, next))[0]
}

const findMaxLoopDistance = (loop: Coord[]): number => {
    return Math.floor(loop.length / 2)
}

const isLoopTile = (loop: Coord[], tile: Coord): boolean => {
    return loop.some(c => c.x === tile.x && c.y === tile.y)
}

const determineStartType = (loop: Coord[], pipe: Pipe): PipeType => {
    const actualConnects = pipe.connects.filter(c => isLoopTile(loop, c))
    const hasEast = actualConnects.some(c => c.x === pipe.coord.x + 1)
    const hasWest = actualConnects.some(c => c.x === pipe.coord.x - 1)
    const hasNorth = actualConnects.some(c => c.y === pipe.coord.y + 1)
    const hasSouth = actualConnects.some(c => c.y === pipe.coord.y - 1)

    if (hasNorth) {
        if (hasSouth) {
            return PipeType.Vertical
        }
        if (hasEast) {
            return PipeType.NEBend
        }
        if (hasWest) {
            return PipeType.NWBend
        }
    }
    if (hasSouth) {
        if (hasEast) {
            return PipeType.SEBend
        }
        if (hasWest) {
            return PipeType.SWBend
        }
    }
    if (hasEast && hasWest) {
        return PipeType.Horizontal
    }

    throw new Error("cannot determine type of start pipe!")
}

const findBoundedByLoop = (pipeMap: PipeMap, loop: Coord[]): number => {
    let count = 0;
    for (let y = 0; y < pipeMap.pipes.length; y++) {
        const row = pipeMap.pipes[y]
        for (let x = 0; x < row.length; x++) {
            const tile = { x, y }
            if (isLoopTile(loop, tile)) {
                continue
            }

            let inLoop = false
            // shoot a 'ray' outwards to determine if we are in the loop
            for (let x1 = x + 1, y1 = y + 1; x1 < row.length && y1 < pipeMap.pipes.length; x1++, y1++) {
                const coord = { x: x1, y: y1 };
                if (isLoopTile(loop, coord)) {
                    const pipe = get(pipeMap.pipes, coord)!;
                    // ignore edges that are colinear with ray
                    if (pipe.pipeType !== PipeType.NEBend && pipe.pipeType !== PipeType.SWBend) {
                        inLoop = !inLoop
                    }
                }
            }

            if (inLoop) {
                count++
            }
        }
    }
    return count
}
