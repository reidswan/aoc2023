import _ from "lodash";
import { Coord, readInput, Map_ } from "../utils"

export const solve = () => {
    const input = readInput("input/day14.txt");
    const rockMap = parseInput(input)

    console.log("Part 1:", calculateLoadWeight(rollNorth(rockMap)))
    console.log("Part 2:", calculateLoadWeight(spin(rockMap)))
}

type RockMap = {
    squareRocksByCol: { [key: string]: Coord[] },
    squareRocksByRow: { [key: string]: Coord[] },
    roundRocks: Coord[],
    gridHeight: number,
    gridWidth: number,
}

const parseInput = (src: string): RockMap => {
    const grid = src.split("\n").map(s => s.split(""))

    const squareRocks: Coord[] = []
    const roundRocks: Coord[] = []

    grid.forEach((row, rowIndex) => {
        row.forEach((it, colIndex) => {
            const coord = { y: rowIndex, x: colIndex }
            switch (it) {
                case '#':
                    squareRocks.push(coord)
                    break
                case 'O':
                    roundRocks.push(coord)
            }
        })
    })

    const rockMap = {
        roundRocks,
        squareRocksByCol: _.groupBy(squareRocks, rockCoord => rockCoord.x),
        squareRocksByRow: _.groupBy(squareRocks, rockCoord => rockCoord.y),
        gridHeight: grid.length,
        gridWidth: grid[0].length
    }

    Object.values(rockMap.squareRocksByCol).forEach(it => it.sort((a, b) => a.y - b.y))
    Object.values(rockMap.squareRocksByRow).forEach(it => it.sort((a, b) => a.x - b.x))

    return rockMap
}

const rollNorth = (rockMap: RockMap): RockMap => {
    const roundByCol = _.groupBy(rockMap.roundRocks, rock => rock.x)
    const roundRocks = _.keys(roundByCol).map(col => {
        const roundRocks = roundByCol[col].sort((a, b) => a.y - b.y)
        const squareRocks = rockMap.squareRocksByCol[col] || []
        let squareRocksIndex = 0
        let rollsTo = 0
        return roundRocks.map(({ x: col, y: row }) => {
            let nextSquare = squareRocks[squareRocksIndex]
            while (nextSquare && (nextSquare.y <= rollsTo || nextSquare.y < row)) {
                rollsTo = Math.max(rollsTo, nextSquare.y + 1)
                squareRocksIndex++
                nextSquare = squareRocks[squareRocksIndex]
            }
            const rollsToCoord = { x: col, y: rollsTo }
            rollsTo++
            return rollsToCoord
        })
    }).reduce((acc, it) => [...acc, ...it], [])

    return {
        ...rockMap,
        roundRocks
    }
}

const rollWest = (rockMap: RockMap): RockMap => {
    const roundByRow = _.groupBy(rockMap.roundRocks, rock => rock.y)
    const roundRocks = _.keys(roundByRow).map(row => {
        const roundRocks = roundByRow[row].sort((a, b) => a.x - b.x)
        const squareRocks = rockMap.squareRocksByRow[row] || []
        let squareRocksIndex = 0
        let rollsTo = 0
        return roundRocks.map(({ x: col, y: row }) => {
            let nextSquare = squareRocks[squareRocksIndex]
            while (nextSquare && (nextSquare.x <= rollsTo || nextSquare.x < col)) {
                rollsTo = Math.max(rollsTo, nextSquare.x + 1)
                squareRocksIndex++
                nextSquare = squareRocks[squareRocksIndex]
            }
            const rollsToCoord = { x: rollsTo, y: row }
            rollsTo++
            return rollsToCoord
        })
    }).reduce((acc, it) => [...acc, ...it], [])

    return {
        ...rockMap,
        roundRocks
    }
}

const rollSouth = (rockMap: RockMap): RockMap => {
    const roundByCol = _.groupBy(rockMap.roundRocks, rock => rock.x)
    const roundRocks = _.keys(roundByCol).map(col => {
        const roundRocks = roundByCol[col].sort((a, b) => b.y - a.y)
        const squareRocks = rockMap.squareRocksByCol[col] || []
        let squareRockIndex = squareRocks.length - 1
        let rollsTo = rockMap.gridHeight - 1
        return roundRocks.map(({ x: col, y: row }) => {
            let nextSquare = squareRocks[squareRockIndex]
            while (nextSquare && (nextSquare.y >= rollsTo || nextSquare.y > row)) {
                rollsTo = Math.min(rollsTo, nextSquare.y - 1)
                squareRockIndex--
                nextSquare = squareRocks[squareRockIndex]
            }
            const rollsToCoord = { x: col, y: rollsTo }
            rollsTo--
            return rollsToCoord
        })
    }).reduce((acc, it) => [...acc, ...it], [])

    return {
        ...rockMap,
        roundRocks
    }
}

const rollEast = (rockMap: RockMap): RockMap => {
    const roundByRow = _.groupBy(rockMap.roundRocks, rock => rock.y)
    const roundRocks = _.keys(roundByRow).map(row => {
        const roundRocks = roundByRow[row].sort((a, b) => b.x - a.x)
        const squareRocks = rockMap.squareRocksByRow[row] || []
        let squareRockIndex = squareRocks.length - 1
        let rollsTo = rockMap.gridWidth - 1
        return roundRocks.map(({ x: col, y: row }) => {
            let nextSquare = squareRocks[squareRockIndex]
            while (nextSquare && (nextSquare.x >= rollsTo || nextSquare.x > col)) {
                rollsTo = Math.min(rollsTo, nextSquare.x - 1)
                squareRockIndex--
                nextSquare = squareRocks[squareRockIndex]
            }
            const rollsToCoord = { x: rollsTo, y: row }
            rollsTo--
            return rollsToCoord
        })
    }).reduce((acc, it) => [...acc, ...it], [])

    return {
        ...rockMap,
        roundRocks
    }
}


const spin = (rockMap: RockMap): RockMap => {
    const seen = new Map_<Coord[], number>();
    const end = 1000000000
    for (let i = 0; i < end; i++) {
        rockMap = spinOnce(rockMap)
        if (seen.has(rockMap.roundRocks)) {
            const loopStart = seen.get(rockMap.roundRocks)!;
            const loopSize = i - loopStart;
            i += loopSize * Math.floor((end - i) / loopSize)
        } else {
            seen.add(rockMap.roundRocks, i)
        }
    }
    return rockMap
}

const spinOnce = (rockMap: RockMap): RockMap => {
    return rollEast(rollSouth(rollWest(rollNorth(rockMap))))
}

const calculateLoadWeight = (rockMap: RockMap): number => {
    return rockMap.roundRocks.reduce((acc, { y }) => acc + rockMap.gridHeight - y, 0)
}