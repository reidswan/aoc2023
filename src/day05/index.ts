import { readInput } from "../utils";

export const solve = () => {
    const lines = readInput("input/day05.txt");
    const input = parseInput(lines);

    let closest = Math.min(...input.seeds.map(seed => traverseSeedToLocation(input.maps, seed)));
    console.log("Part 1:", closest)

    const ranges = makeSeedRanges(input.seeds);
    closest = Math.min(
        ...ranges.map(range => traverseSeedRangeToLocations(range, input.maps))
            .flat()
            .map(range => range.start));
    console.log("Part 2:", closest);
}

type MapRange = {
    sourceStart: number
    destinationStart: number
    count: number
}

type Map = {
    name: string,
    ranges: MapRange[]
}

type Input = {
    seeds: number[],
    maps: Map[],
}

type SeedRange = {
    start: number,
    count: number,
}

const parseInput = (src: string): Input => {
    const [seedsPart, ...parts] = src.split("\n\n");

    const seeds = seedsPart.replace("seeds:", "")
        .split(" ")
        .filter(i => i !== "")
        .map(s => parseInt(s))

    const maps = parts.map(part => {
        const [nameS, ...lines] = part.split("\n").filter(s => s !== "");
        const nameRe = /(?<name>[a-z-]+) map:/.exec(nameS);
        if (!nameRe || !nameRe.groups) {
            throw new Error(`unexpected name: ${nameRe}`)
        }

        const name = nameRe.groups["name"];
        const ranges = lines.map(parseMapRange)
        ranges.sort((r1, r2) => r1.sourceStart - r2.sourceStart)
        return {
            name,
            ranges,
        }
    })

    return {
        seeds,
        maps
    }
}

const parseMapRange = (src: string): MapRange => {
    const [destinationStart, sourceStart, count] = src.split(" ").map(s => parseInt(s))

    return {
        sourceStart,
        destinationStart,
        count,
    }
}

const findInMap = (map: Map, item: number): number => {
    const range = map.ranges.find(range => range.sourceStart <= item && item < range.sourceStart + range.count);
    if (range === undefined) {
        // If not explicitly listed, it maps to itself
        return item
    }

    return range.destinationStart + (item - range.sourceStart)
}

const traverseSeedToLocation = (maps: Map[], seed: number): number => {
    let current = seed;

    for (const map of maps) {
        current = findInMap(map, current)
    }

    return current
}

const findNextLocationRanges = (seedRange: SeedRange, map: Map): SeedRange[] => {
    const ranges: SeedRange[] = []
    let currStart = seedRange.start;
    let remainingCount = seedRange.count;
    while (remainingCount > 0) {
        let range = map.ranges.find(range => range.sourceStart <= currStart && currStart < range.sourceStart + range.count);
        if (range === undefined) {
            // If not explicitly listed, it maps to itself; find where the next range would start
            const nextMapStarts = map.ranges.filter(r => r.sourceStart > currStart).map(r => r.sourceStart);
            if (nextMapStarts.length !== 0) {
                // Convert into an 'identity' range
                const nextStart = Math.min(...nextMapStarts);
                range = { sourceStart: currStart, destinationStart: currStart, count: nextStart - currStart }
            } else {
                // There is no next map, so use all remaining count
                ranges.push({ start: currStart, count: remainingCount })
                break
            }
        }

        const destinationStart = range.destinationStart + (currStart - range.sourceStart);
        const countFromOffset = range.count - (destinationStart - range.destinationStart);
        ranges.push({ start: destinationStart, count: Math.min(countFromOffset, remainingCount) });
        remainingCount -= countFromOffset
        currStart += countFromOffset
    }

    return ranges
}

const traverseSeedRangeToLocations = (range: SeedRange, maps: Map[]): SeedRange[] => {
    let currRanges = [range];
    for (const map of maps) {
        currRanges = currRanges.map(range => findNextLocationRanges(range, map)).flat()
    }
    return currRanges
}

const makeSeedRanges = (src: number[]): SeedRange[] => {
    const res = [];
    for (let i = 0; i < src.length - 1; i += 2) {
        res.push({ start: src[i], count: src[i + 1] })
    }

    return res
}
