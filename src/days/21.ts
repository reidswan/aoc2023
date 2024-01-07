import _ from "lodash";
import {
  Coord,
  addCoords,
  Set,
  get,
  readInputGrid,
  Map_,
  hashCoord,
} from "../utils";
import { HeapQueue } from "../utils/heapqueue";

export const solve = () => {
  const gardenMap = parseInput(readInputGrid("input/day21.txt"));
  console.log("Part 1:", countLocationsForSteps(gardenMap, 64));
  console.log("Part 2:", countLocationsForStepsP2(gardenMap));
};

enum PlotType {
  Rock = "#",
  Garden = ".",
}

type GardenMap = {
  locations: PlotType[][];
  start: Coord;
};

const parseInput = (grid: string[][]): GardenMap => {
  let start: Coord | undefined = undefined;

  const locations = grid.map((row, y) =>
    row.map((entry, x) => {
      switch (entry) {
        case "#":
          return PlotType.Rock;
        case ".":
          return PlotType.Garden;
        case "S":
          start = { x, y };
          return PlotType.Garden;
      }
      throw new Error(`Unrecognized plot type: '${entry}'`);
    }),
  );

  if (start === undefined) {
    throw new Error("start not found");
  }

  return { locations, start };
};

const countLocationsForSteps = (gardenMap: GardenMap, n: number): number => {
  let locs = new Set<Coord>(hashCoord);
  locs.add(gardenMap.start);
  for (let i = 0; i < n; i++) {
    locs = step(gardenMap.locations, locs, get);
  }

  return locs.count();
};

const step = (
  locations: PlotType[][],
  from: Set<Coord>,
  getLoc: (grid: PlotType[][], coord: Coord) => PlotType | undefined,
): Set<Coord> => {
  const res = new Set<Coord>(hashCoord);
  from
    .values()
    .map((c) =>
      neighbors(c).filter((c2) => getLoc(locations, c2) === PlotType.Garden),
    )
    .flat()
    .forEach((it) => res.add(it));
  return res;
};

const cardinals = [
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: -1, y: 0 },
];

const neighbors = (coord: Coord): Coord[] => {
  return cardinals.map((c) => addCoords(c, coord));
};

const computeShortestDistances = (
  locations: PlotType[][],
  from: Coord,
): Map_<Coord, number> => {
  const queue = new HeapQueue<{ loc: Coord; dist: number }>(
    (a, b) => a.dist < b.dist,
  );
  queue.enqueue({ loc: from, dist: 0 });

  const shortests = new Map_<Coord, number>(hashCoord);
  shortests.add(from, 0);

  const visited = new Set<Coord>(hashCoord);

  while (queue.size() > 0) {
    const { loc, dist } = queue.dequeue()!;
    if (visited.has(loc)) {
      continue;
    }
    visited.add(loc);

    neighbors(loc).forEach((neighbor) => {
      if (get(locations, neighbor) !== PlotType.Garden) {
        return;
      }

      const shortest = Math.min(dist + 1, shortests.get(neighbor) || Infinity);
      shortests.add(neighbor, shortest);
      queue.enqueue({ loc: neighbor, dist: shortest });
    });
  }

  return shortests;
};

// Credit: https://github.com/villuna/aoc23/wiki/A-Geometric-solution-to-advent-of-code-2023,-day-21
const countLocationsForStepsP2 = (gardenMap: GardenMap): number => {
  const shortestDists = computeShortestDistances(
    gardenMap.locations,
    gardenMap.start,
  );
  const [evens, odds] = _.partition(
    shortestDists.items(),
    ([, dist]) => dist % 2 === 0,
  );
  const evenCorners = evens.filter(([, dist]) => dist > 65).length;
  const oddCorners = odds.filter(([, dist]) => dist > 65).length;
  const n =
    (26501365 - Math.floor(gardenMap.locations.length / 2)) /
    gardenMap.locations.length;
  return (
    (n + 1) * (n + 1) * odds.length +
    n * n * evens.length -
    (n + 1) * oddCorners +
    n * (evenCorners - 1)
  );
};
