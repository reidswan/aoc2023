import _ from "lodash"
import { filterMap, readInput, Coord } from "../utils"

export const solve = () => {
    const inputRaw = readInput("input/day11.txt")
    const spaceMap = parseInput(inputRaw)
    let distances = findDistances(spaceMap)
    console.log("Part 1:", distances)

    distances = findDistances(spaceMap, 1000000)
    console.log("Part 2:", distances)
}

type SpaceMap = {
    galaxyLocations: Coord[],
}

export const parseInput = (s: string): SpaceMap => {
    const galaxyLocations = filterMap(s.split("\n"),
        (line, y) => filterMap(line.split(""),
            (c, x) => {
                if (c === "#") {
                    return { x, y }
                }
            }
        )
    ).flat()

    return { galaxyLocations }
}

export const findDistances = (spaceMap: SpaceMap, expansionFactor: number = 2): number => {
    const maxRow = Math.max(...spaceMap.galaxyLocations.map(it => it.x))
    const maxCol = Math.max(...spaceMap.galaxyLocations.map(it => it.y))

    const emptyRows = _.range(maxRow).filter(row => !spaceMap.galaxyLocations.some(l => l.x === row))
    const emptyCols = _.range(maxCol).filter(col => !spaceMap.galaxyLocations.some(l => l.y === col))

    let totalDistance = 0
    for (let from = 0; from < spaceMap.galaxyLocations.length; from++) {
        for (let to = from + 1; to < spaceMap.galaxyLocations.length; to++) {
            const fromGalaxy = spaceMap.galaxyLocations[from]
            const toGalaxy = spaceMap.galaxyLocations[to]
            const [xStart, xEnd] = [Math.min(fromGalaxy.x, toGalaxy.x), Math.max(fromGalaxy.x, toGalaxy.x)]
            const [yStart, yEnd] = [Math.min(fromGalaxy.y, toGalaxy.y), Math.max(fromGalaxy.y, toGalaxy.y)]
            let distance = (xEnd - xStart) + (yEnd - yStart)
            distance += emptyRows.filter(row => xStart < row && row < xEnd).length * (expansionFactor - 1)
            distance += emptyCols.filter(col => yStart < col && col < yEnd).length * (expansionFactor - 1)
            totalDistance += distance
        }
    }

    return totalDistance
}