import fs from "fs"

export const readInput = (path: string): string => {
    return fs.readFileSync(path).toString()
}

export const readInputLines = (path: string): string[] => {
    const contents = readInput(path);

    return contents.split("\n")
}

export const isNumeric = (s: string): boolean => {
    return !!s.match(/[0-9]+/)
}
