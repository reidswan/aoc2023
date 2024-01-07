const days: { [key: string]: string } = {
    "1": "./days/01",
    "2": "./days/02",
    "3": "./days/03",
    "4": "./days/04",
    "5": "./days/05",
    "6": "./days/06",
    "7": "./days/07",
    "8": "./days/08",
    "9": "./days/09",
    "10": "./days/10",
    "11": "./days/11",
    "12": "./days/12",
    "13": "./days/13",
    "14": "./days/14",
    "15": "./days/15",
    "16": "./days/16",
    "17": "./days/17",
    "18": "./days/18",
    "19": "./days/19",
    "20": "./days/20",
    "21": "./days/21",
    "22": "./days/22",
    "23": "./days/23",
    "24": "./days/24",
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

if (day in days) {
    console.log(`==== Day ${day} ====`)
    import(days[day]).then(m => m.solve())
} else {
    console.error(`Unrecognized day: ${day}`)
}
