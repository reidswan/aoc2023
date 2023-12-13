import * as day01 from "./days/01"
import * as day02 from "./days/02"
import * as day03 from "./days/03"
import * as day04 from "./days/04"
import * as day05 from "./days/05"
import * as day06 from "./days/06"
import * as day07 from "./days/07"
import * as day08 from "./days/08"
import * as day09 from "./days/09"
import * as day10 from "./days/10"
import * as day11 from "./days/11"
import * as day12 from "./days/12"
import * as day13 from "./days/13"

const days: { [key: string]: { solve: () => void } } = {
    "1": day01,
    "2": day02,
    "3": day03,
    "4": day04,
    "5": day05,
    "6": day06,
    "7": day07,
    "8": day08,
    "9": day09,
    "10": day10,
    "11": day11,
    "12": day12,
    "13": day13,
}
const possibleDays = Object.keys(days)

const dayToRun = (): string => {
    if (process.argv.length >= 3) {
        return process.argv[2]
    }

    // Default to last day in the object
    return possibleDays[possibleDays.length - 1]
}

const day = dayToRun()

if (!possibleDays.includes(day)) {
    console.error(`Unrecognized day: ${day}`)
} else {
    console.log(`==== Day ${day} ====`)
    days[day].solve()
}
