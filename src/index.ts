import * as day01 from "./day01"
import * as day02 from "./day02"
import * as day03 from "./day03"
import * as day04 from "./day04"
import * as day05 from "./day05"
import * as day06 from "./day06"
import * as day07 from "./day07"

const days: { [key: string]: { solve: () => void } } = {
    "1": day01,
    "2": day02,
    "3": day03,
    "4": day04,
    "5": day05,
    "6": day06,
    "7": day07,
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
