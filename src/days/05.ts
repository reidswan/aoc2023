import _ from "lodash";
import { readInput } from "../utils";

export const solve = () => {
  const lines = readInput("input/day05.txt");
  const input = parseInput(lines);

  let closest = Math.min(
    ...input.seeds.map((seed) => traverseSeedToLocation(input.maps, seed)),
  );
  console.log("Part 1:", closest);

  const ranges = makeSeedRanges(input.seeds);
  closest = Math.min(
    ...ranges
      .map((range) => traverseSeedRangeToLocations(range, input.maps))
      .flat()
      .map((range) => range.start),
  );
  console.log("Part 2:", closest);
};

type MapRange = {
  sourceStart: number;
  destinationStart: number;
  count: number;
};

type Map = {
  name: string;
  ranges: MapRange[];
};

type Input = {
  seeds: number[];
  maps: Map[];
};

type SeedRange = {
  start: number;
  count: number;
};

const parseInput = (src: string): Input => {
  const [seedsPart, ...parts] = src.split("\n\n");

  const seeds = seedsPart
    .replace("seeds:", "")
    .split(" ")
    .filter((i) => i !== "")
    .map((s) => parseInt(s));

  const maps = parts.map((part) => {
    const [nameS, ...lines] = part.split("\n").filter((s) => s !== "");
    const nameRe = /(?<name>[a-z-]+) map:/.exec(nameS);
    if (!nameRe || !nameRe.groups) {
      throw new Error(`unexpected name: ${nameRe}`);
    }

    const name = nameRe.groups["name"];
    const ranges = lines.map(parseMapRange);
    ranges.sort((a, b) => a.sourceStart - b.sourceStart);
    return {
      name,
      ranges,
    };
  });

  return {
    seeds,
    maps,
  };
};

const parseMapRange = (src: string): MapRange => {
  const [destinationStart, sourceStart, count] = src
    .split(" ")
    .map((s) => parseInt(s));

  return {
    sourceStart,
    destinationStart,
    count,
  };
};

const findInMap = (map: Map, item: number): number => {
  const range = map.ranges.find(
    (range) =>
      range.sourceStart <= item && item < range.sourceStart + range.count,
  );
  if (range === undefined) {
    // If not explicitly listed, it maps to itself
    return item;
  }

  return range.destinationStart + (item - range.sourceStart);
};

const traverseSeedToLocation = (maps: Map[], seed: number): number => {
  return maps.reduce((acc, map) => findInMap(map, acc), seed);
};

const traverseSeedRange = (seedRange: SeedRange, map: Map): SeedRange[] => {
  const ranges: SeedRange[] = [];
  const remainder = map.ranges.reduce((seedRange, mapRange) => {
    if (seedRange.count <= 0) {
      // Short circuit
      return seedRange;
    }

    if (seedRange.start < mapRange.sourceStart) {
      // Section not explicitly mapped; use values directly
      ranges.push({
        start: seedRange.start,
        count: Math.min(
          seedRange.count,
          mapRange.sourceStart - seedRange.start,
        ),
      });

      seedRange = {
        start: mapRange.sourceStart,
        count: seedRange.count - (mapRange.sourceStart - seedRange.start),
      };
    }

    const { overlap, remainder } = findOverlap(mapRange, seedRange);
    if (overlap !== undefined) {
      ranges.push(overlap);
    }

    return remainder;
  }, seedRange);

  if (remainder.count > 0) {
    ranges.push(remainder);
  }

  return ranges;
};

const overlaps = (m: MapRange, s: SeedRange): boolean => {
  return m.sourceStart <= s.start && s.start < m.sourceStart + m.count;
};

const findOverlap = (
  m: MapRange,
  s: SeedRange,
): { overlap: SeedRange | undefined; remainder: SeedRange } => {
  if (!overlaps(m, s)) {
    return { overlap: undefined, remainder: s };
  }

  const offset = m.destinationStart - m.sourceStart;
  const start = s.start + offset;
  const count = Math.min(m.count - (s.start - m.sourceStart), s.count);

  const remainingCount = s.count - count;
  const excessStart = s.start + count;

  return {
    overlap: { start, count },
    remainder: { start: excessStart, count: remainingCount },
  };
};

const traverseSeedRangeToLocations = (
  range: SeedRange,
  maps: Map[],
): SeedRange[] => {
  return maps.reduce(
    (ranges, map) =>
      ranges.map((range) => traverseSeedRange(range, map)).flat(),
    [range],
  );
};

const makeSeedRanges = (src: number[]): SeedRange[] => {
  return _.chunk(src, 2).map(([start, count]) => ({ start, count }));
};
