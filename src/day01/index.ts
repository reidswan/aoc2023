import { readInputLines } from "../utils";

export const solve = () => {
    const lines = readInputLines("input/day01.txt").filter(line => line.length > 0);

    const sum = lines.map(line => findNumber(line, filterDigits))
        .reduce((acc, i) => acc + i);

    console.log("Part 1: ", sum);

    const sum2 = lines.map(line => findNumber(line, filterWordyDigits)).
        reduce((acc, i) => acc + i);

    console.log("Part 2: ", sum2);
}

const digits = "0123456789";
const wordyDigits = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "zero": 0,
}

const filterDigits = (s: string): number[] => {
    return [...s].filter(c => digits.includes(c)).map(c => parseInt(c))
}

const findNumber = (s: string, digitFilter: (s: string) => number[]): number => {
    const digits = digitFilter(s);
    if (digits.length == 0) {
        throw new Error(`no digits in string ${s}`);
    }

    return 10 * digits[0] + digits[digits.length - 1]
}

const digitWordStartingAt = (s: string, i: number): number | undefined => {
    for (const [digitWord, digit] of Object.entries(wordyDigits)) {
        if (s.substring(i).startsWith(digitWord)) {
            return digit
        }
    }

    return undefined
}

const filterWordyDigits = (s: string): number[] => {
    const res = [];

    for (let i = 0; i < s.length; i++) {
        if (digits.includes(s.charAt(i))) {
            res.push(parseInt(s.charAt(i)))
        } else {
            const digit = digitWordStartingAt(s, i);
            if (digit !== undefined) {
                res.push(digit)
            }
        }
    }

    return res
}
