import fs from "fs"
import WSet from "./wset"

export const readInput = (path: string): string => {
    return fs.readFileSync(path).toString()
}

export const readInputLines = (path: string): string[] => {
    const contents = readInput(path);

    return contents.split("\n")
}

export { WSet }