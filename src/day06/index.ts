import { isNumeric, readInputLines } from "../utils"

export const solve = () => {
    const lines = readInputLines("input/day06.txt");
    const races = parseInputP1(lines);

    let result = races.map(calcWinningButtonPresses).reduce((acc, it) => acc * it, 1)
    console.log("Part 1:", result);

    const race = parseInputP2(lines)
    result = calcWinningButtonPresses(race)
    console.log("Part 2:", result)
}

type Race = {
    time: number
    distance: number
}

const parseInputP1 = (lines: string[]): Race[] => {
    const [timesRaw, distancesRaw] = lines;
    const times = timesRaw.split(" ").filter(isNumeric).map(s => parseInt(s))
    const distances = distancesRaw.split(" ").filter(isNumeric).map(s => parseInt(s))

    if (times.length !== distances.length) {
        throw new Error(`got ${times.length} times but ${distances.length} distances!`)
    }

    return times.map((t, i) => ({ time: t, distance: distances[i] }))
}

const parseInputP2 = (lines: string[]): Race => {
    const [time, distance] = lines;

    return {
        time: parseInt([...time].filter(isNumeric).join("")),
        distance: parseInt([...distance].filter(isNumeric).join(""))
    }
}

const calcWinningButtonPresses = ({ time, distance }: Race): number => {
    const upper = Math.ceil((time + Math.sqrt(time * time - 4 * distance)) / 2)
    const lower = Math.floor((time - Math.sqrt(time * time - 4 * distance)) / 2)

    return upper - lower - 1
}
