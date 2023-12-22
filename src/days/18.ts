import { readInputLines, Coord } from "../utils"

export const solve = () => {
    const digMap = readInputLines("input/day18.txt").map(parseDigMapEntry)
    console.log("Part 1:", calcDugSquares(digMap))
    console.log("Part 2:", calcDugSquares(digMap.map(entry => convertColorCode(entry.colorCode))))
}

type DigMapEntry = {
    direction: Direction,
    distance: number,
    colorCode: string
}

const parseDigMapEntry = (s: string): DigMapEntry => {
    const parts = s.split(" ");
    if (parts.length < 3) {
        throw new Error(`invalid format: ${s}`)
    }

    const [directionS, distanceS, colorCodeS] = parts
    const direction = parseDirection(directionS)
    const distance = parseInt(distanceS)
    const colorCode = colorCodeS.replace("(", "").replace(")", "")

    return { direction, distance, colorCode }
}

enum Direction {
    Left = "L",
    Right = "R",
    Up = "U",
    Down = "D",
}

const parseDirection = (s: string): Direction => {
    switch (s) {
        case "L":
        case "R":
        case "U":
        case "D":
            return s as Direction
    }

    throw new Error(`invalid direction: ${s}`)
}

const convertColorCode = (s: string): DigMapEntry => {
    const digs = s.replace("#", "")
    const hexNum = digs.substring(0, 5)
    const directionS = digs.substring(5, 6)
    const distance = parseInt(hexNum, 16)
    let direction: Direction;
    switch (directionS) {
        case "0":
            direction = Direction.Right
            break
        case "1":
            direction = Direction.Down
            break
        case "2":
            direction = Direction.Left
            break
        case "3":
            direction = Direction.Up
            break
        default:
            throw new Error(`cannot parse to direction: ${directionS}`)
    }

    return { colorCode: s, direction, distance }
}

const calcDugSquares = (digMap: DigMapEntry[]) => {
    const { vertexPoints } = digMap.reduce(({ vertexPoints, prev }, entry) => {
        const end = move(prev, entry.direction, entry.distance)
        vertexPoints.push(end)
        return { vertexPoints, prev: end }
    }, { vertexPoints: [] as Coord[], prev: { x: 0, y: 0 } })

    const boundaryPoints = digMap.reduce((acc, it) => acc + it.distance, 0)

    const sum = vertexPoints.reduce((sum, point, index) => {
        const next = vertexPoints[(index + 1) % vertexPoints.length]
        return sum + (point.x * next.y) - (next.x * point.y)
    }, 0)

    return (Math.abs(sum) + boundaryPoints) / 2 + 1
}

export const move = ({ x, y }: Coord, direction: Direction, distance: number): Coord => {
    switch (direction) {
        case Direction.Up: return { x, y: y + distance }
        case Direction.Down: return { x, y: y - distance }
        case Direction.Left: return { x: x - distance, y }
        case Direction.Right: return { x: x + distance, y }
    }
}
