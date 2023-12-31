import { readInputLines } from "../utils";

enum Colour {
  RED = "red",
  GREEN = "green",
  BLUE = "blue",
}

const allColours: Colour[] = [Colour.RED, Colour.GREEN, Colour.BLUE];

type Game = {
  id: number;
  draws: Draw[];
};

type Draw = { [key in Colour]: number };

const cubeTotals: Draw = {
  [Colour.RED]: 12,
  [Colour.GREEN]: 13,
  [Colour.BLUE]: 14,
};

export const solve = () => {
  const input = readInputLines("input/day02.txt")
    .filter((i) => i.length > 0)
    .map(parseLine);

  const part1 = input
    .filter(isPossibleGame)
    .map((g) => g.id)
    .reduce((acc, it) => acc + it);

  console.log("Part 1:", part1);

  const part2 = input
    .map(determineCubeRequirements)
    .map(calculatePower)
    .reduce((acc, it) => acc + it);

  console.log("Part 2:", part2);
};

const isPossibleGame = (g: Game): boolean => {
  return g.draws.every((d) => {
    return allColours.every((colour) => d[colour] <= cubeTotals[colour]);
  });
};

const determineCubeRequirements = (g: Game): Draw => {
  const totals: Draw = {
    [Colour.RED]: 0,
    [Colour.GREEN]: 0,
    [Colour.BLUE]: 0,
  };

  g.draws.forEach((draw) => {
    allColours.forEach(
      (colour) => (totals[colour] = Math.max(draw[colour], totals[colour])),
    );
  });

  return totals;
};

const calculatePower = (draw: Draw) => {
  return Object.values(draw).reduce((acc, it) => acc * it, 1);
};

const parseLine = (src: string): Game => {
  const [idPart, rest] = src.split(":");

  const idCap = /Game (?<id>\d+)/.exec(idPart);
  if (idCap == null || idCap.groups === undefined) {
    throw new Error(`Unexpected format for id: ${idPart}`);
  }

  const id = parseInt(idCap.groups["id"]);

  const draws = rest.split(";").map(parseDraw);

  return {
    id,
    draws,
  };
};

const parseDraw = (src: string): Draw => {
  const draw: Draw = {
    [Colour.RED]: 0,
    [Colour.GREEN]: 0,
    [Colour.BLUE]: 0,
  };

  const parsers: { [key in Colour]: RegExp } = {
    [Colour.RED]: /(?<count>\d+)\s+red/,
    [Colour.BLUE]: /(?<count>\d+)\s+blue/,
    [Colour.GREEN]: /(?<count>\d+)\s+green/,
  };

  for (const [colour, parser] of Object.entries(parsers)) {
    const cap = parser.exec(src);
    if (!cap || !cap.groups) continue;

    draw[colour as Colour] = parseInt(cap.groups["count"]);
  }

  return draw;
};
