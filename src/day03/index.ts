import { readInputLines } from "../utils"

export const solve = () => {
    const rawInput = readInputLines("input/day03.txt");

    const { symbolsByRow, parts } = parseInput(rawInput);

    const validParts = parts.filter((p) => isValidEnginePart(p, symbolsByRow));
    const validPartSum = validParts
        .map(n => n.partNumber)
        .reduce((acc, it) => acc + it);

    console.log("Part 1:", validPartSum);

    const totalGearRatio = Object.values(symbolsByRow)
        .flat()
        .filter((s) => s.symbol === "*")
        .map(g => gearRatio(g, validParts))
        .reduce((acc, it) => acc + it);

    console.log("Part 2:", totalGearRatio)
}

const digits = "0123456789"
type Coord = [number, number]

type EnginePart = {
    partNumber: number,
    start: Coord,
    end: Coord,
}

type SchematicSymbol = {
    symbol: string,
    location: Coord
}

type ByRow<T> = { [key: number]: T }

type ParseResult = {
    symbolsByRow: ByRow<SchematicSymbol[]>,
    parts: EnginePart[]
}

const parseInput = (lines: string[]): ParseResult => {
    const parts: EnginePart[] = []
    const symbolsByRow: ByRow<SchematicSymbol[]> = {}

    lines.forEach((line, row) => {
        const rowSymbs: SchematicSymbol[] = [];

        for (let column = 0; column < line.length; column++) {
            if (line.charAt(column) === ".") {
                continue
            } else if (digits.includes(line.charAt(column))) {
                let end = column;
                while (end < line.length && digits.includes(line.charAt(end))) {
                    end++
                }

                parts.push({
                    partNumber: parseInt(line.substring(column, end)),
                    start: [row, column],
                    end: [row, end - 1],
                })

                column = end - 1
            } else {
                rowSymbs.push({
                    symbol: line.charAt(column),
                    location: [row, column],
                })
            }
        }

        symbolsByRow[row] = rowSymbs;
    })

    return { symbolsByRow, parts }
}

const isValidEnginePart = (part: EnginePart, symbols: ByRow<SchematicSymbol[]>) => {
    const [partRow] = part.start;
    for (let i = -1; i <= 1; i++) {
        const row = symbols[partRow + i];
        if (row && row.some(sym => overlaps(part, sym))) {
            return true
        }
    }
    return false
}

const overlaps = (part: EnginePart, sym: SchematicSymbol): boolean => {
    // start and end have same row
    const { start: [row, startCol], end: [, endCol] } = part;
    const { location: [symRow, symCol] } = sym;
    // part row must be within 1 row of symbol row
    const rowMatch = Math.abs(symRow - row) <= 1;
    if (!rowMatch) {
        // Non-overlapping rows
        return false
    }

    const symColStart = symCol - 1;
    const symColEnd = symCol + 1;

    return (startCol <= symColEnd) && (endCol >= symColStart);
}

const gearRatio = (maybeGear: SchematicSymbol, parts: EnginePart[]): number => {
    const adjParts = parts.filter(p => overlaps(p, maybeGear))
    if (adjParts.length >= 2) {
        return adjParts.reduce((acc, it) => acc * it.partNumber, 1)
    }

    return 0
}
