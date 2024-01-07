import { Coord, get, readInputGrid, Set } from "../utils";

export const solve = () => {
  const grid = parseInput(readInputGrid("input/day16.txt"));
  const energizedCount = countEnergizedCells(grid, {
    location: { x: -1, y: 0 },
    direction: Direction.Right,
  });
  console.log("Part 1:", energizedCount);

  const maxEnergized = maxEnergizedCellCount(grid);
  console.log("Part 2:", maxEnergized);
};

enum TileType {
  Empty = ".",
  HorizontalSplit = "-",
  VerticalSplit = "|",
  ForwardMirror = "/",
  BackwardMirror = "\\",
}

enum Direction {
  Left = "left",
  Right = "right",
  Up = "up",
  Down = "down",
}

type Beam = {
  location: Coord;
  direction: Direction;
};

const parseInput = (s: string[][]): TileType[][] => {
  return s.map((row) =>
    row.map((c) => {
      switch (c) {
        case ".":
          return TileType.Empty;
        case "-":
          return TileType.HorizontalSplit;
        case "|":
          return TileType.VerticalSplit;
        case "/":
          return TileType.ForwardMirror;
        case "\\":
          return TileType.BackwardMirror;
      }

      throw new Error(`unrecognized tile: ${c}`);
    }),
  );
};

const maxEnergizedCellCount = (grid: TileType[][]): number => {
  const allStarts: Beam[] = [];
  grid.forEach((row, y) => {
    allStarts.push({ location: { x: -1, y }, direction: Direction.Right });
    allStarts.push({
      location: { x: row.length, y },
      direction: Direction.Left,
    });
  });
  grid[0].forEach((_, x) => {
    allStarts.push({ location: { x, y: -1 }, direction: Direction.Down });
    allStarts.push({
      location: { x, y: grid.length },
      direction: Direction.Up,
    });
  });

  return Math.max(
    ...allStarts.map((start) => countEnergizedCells(grid, start)),
  );
};

const countEnergizedCells = (grid: TileType[][], start: Beam): number => {
  const cellEnergized = grid.map((row) => row.map(() => false));
  const seen = new Set<Beam>();
  let beams = [start];
  while (beams.length) {
    beams = beams
      .map((beam) =>
        transitionOnce(beam, grid).filter((beam) => !seen.has(beam)),
      )
      .flat();
    beams.forEach((beam) => {
      cellEnergized[beam.location.y][beam.location.x] = true;
      seen.add(beam);
    });
  }

  return cellEnergized.reduce(
    (acc, row) => acc + row.filter((isEnergized) => isEnergized).length,
    0,
  );
};

const transitionOnce = (beam: Beam, grid: TileType[][]): Beam[] => {
  let newLocation: Coord;
  switch (beam.direction) {
    case Direction.Down:
      newLocation = { x: beam.location.x, y: beam.location.y + 1 };
      break;
    case Direction.Up:
      newLocation = { x: beam.location.x, y: beam.location.y - 1 };
      break;
    case Direction.Left:
      newLocation = { x: beam.location.x - 1, y: beam.location.y };
      break;
    case Direction.Right:
      newLocation = { x: beam.location.x + 1, y: beam.location.y };
      break;
  }

  const tile = get(grid, newLocation);
  if (tile === undefined) {
    // Beam went off the grid
    return [];
  }

  let newDirections: Direction[];
  switch (tile) {
    case TileType.Empty:
      newDirections = [beam.direction];
      break;
    case TileType.ForwardMirror:
      newDirections = [reflectInForwardMirror(beam.direction)];
      break;
    case TileType.BackwardMirror:
      newDirections = [reflectInBackwardMirror(beam.direction)];
      break;
    case TileType.HorizontalSplit:
      if (
        beam.direction == Direction.Left ||
        beam.direction == Direction.Right
      ) {
        newDirections = [beam.direction];
      } else {
        newDirections = [Direction.Left, Direction.Right];
      }
      break;
    case TileType.VerticalSplit:
      if (beam.direction == Direction.Up || beam.direction == Direction.Down) {
        newDirections = [beam.direction];
      } else {
        newDirections = [Direction.Up, Direction.Down];
      }
      break;
  }

  return newDirections.map((direction) => ({
    location: newLocation,
    direction,
  }));
};

const reflectInForwardMirror = (direction: Direction): Direction => {
  switch (direction) {
    case Direction.Down:
      return Direction.Left;
    case Direction.Left:
      return Direction.Down;
    case Direction.Up:
      return Direction.Right;
    case Direction.Right:
      return Direction.Up;
  }
};

const reflectInBackwardMirror = (direction: Direction): Direction => {
  switch (direction) {
    case Direction.Down:
      return Direction.Right;
    case Direction.Right:
      return Direction.Down;
    case Direction.Up:
      return Direction.Left;
    case Direction.Left:
      return Direction.Up;
  }
};
