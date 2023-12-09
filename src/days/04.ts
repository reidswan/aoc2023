import _ from "lodash";
import { readInputLines } from "../utils"

export const solve = () => {
    const lines = readInputLines("input/day04.txt")
    const plays = parseInput(lines);
    const winnings = plays.map(calculateWinnings).reduce((acc, it) => acc + it)
    console.log("Part 1:", winnings);

    const totalCards = calculateTotalCards(plays);
    console.log("Part 2:", totalCards)
}

type Play = {
    id: number,
    winningNumbers: Set<number>,
    drawnNumbers: Set<number>,
}

const parseInput = (s: string[]): Play[] => {
    return s.map(parseLine)
}

const parseLine = (s: string): Play => {
    const [idS, rest] = s.split(":");
    const idRe = /Card\s*(?<id>\d+)/.exec(idS);
    if (!idRe || !idRe.groups) {
        throw new Error(`unexpected format for line: ${s}`)
    }

    const id = parseInt(idRe.groups["id"]);
    const [winNumsS, drawnNumsS] = rest.split("|")

    return {
        id,
        winningNumbers: new Set(parseNumberList(winNumsS)),
        drawnNumbers: new Set(parseNumberList(drawnNumsS))
    }
}

const parseNumberList = (s: string): number[] => {
    return s.split(" ").filter(s => s.match(/[0-9]+/)).map(s => parseInt(s))
}

const countMatches = (p: Play): number => {
    return _.intersection([...p.drawnNumbers], [...p.winningNumbers]).length
}

const calculateWinnings = (p: Play): number => {
    const pointCount = countMatches(p)
    if (pointCount > 0) {
        return Math.pow(2, pointCount - 1)
    } else {
        return 0
    }
}

const calculateTotalCards = (plays: Play[]): number => {
    const countByCard: { [key: number]: number } = {}
    plays.forEach(play => countByCard[play.id] = 1)

    plays.forEach(play => {
        const matchCount = countMatches(play);
        const cardCount = countByCard[play.id];
        for (let i = 1; i <= matchCount; i++) {
            countByCard[play.id + i] += cardCount
        }
    })

    return Object.values(countByCard).reduce((acc, it) => acc + it)
}
