import _ from "lodash";
import { readInput } from "../utils";

export const solve = () => {
  const input = readInput("input/day15.txt");
  console.log("Part 1:", input.split(",").map(hash).reduce(_.add));

  const instructions = parseInput(input);
  const lensMap = buildLensMap(instructions);
  const focusingPower = computeFocusingPower(lensMap);
  console.log("Part 2:", focusingPower);
};

const hash = (s: string): number => {
  return [...s].reduce((acc, c) => ((acc + c.charCodeAt(0)) * 17) % 256, 0);
};

enum Operation {
  Insert = "=",
  Remove = "-",
}

type Instruction =
  | {
      label: string;
      operation: Operation.Remove;
    }
  | {
      label: string;
      operation: Operation.Insert;
      focalLength: number;
    };

type Lens = {
  label: string;
  focalLength: number;
};

const parseInput = (s: string): Instruction[] => {
  return s.split(",").map(parseInstruction);
};

const parseInstruction = (s: string): Instruction => {
  const [label, focalLength] = s.split("=");
  if (focalLength !== undefined) {
    return {
      label,
      operation: Operation.Insert,
      focalLength: parseInt(focalLength),
    };
  }

  return {
    label: s.replace("-", ""),
    operation: Operation.Remove,
  };
};

const applyInstruction = (
  map: Map<number, Lens[]>,
  instruction: Instruction,
): Map<number, Lens[]> => {
  const destinationBox = hash(instruction.label);
  if (!map.has(destinationBox)) {
    map.set(destinationBox, []);
  }

  switch (instruction.operation) {
    case Operation.Remove:
      map.set(
        destinationBox,
        map.get(destinationBox)!.filter((it) => it.label !== instruction.label),
      );
      break;
    case Operation.Insert:
      map.set(
        destinationBox,
        addOrReplaceLens(map.get(destinationBox)!, instruction),
      );
  }

  return map;
};

const addOrReplaceLens = (lenses: Lens[], lens: Lens): Lens[] => {
  const found = lenses.findIndex((l) => l.label === lens.label);
  if (found !== -1) {
    lenses[found].focalLength = lens.focalLength;
    return lenses;
  }

  return [...lenses, lens];
};

const buildLensMap = (instructions: Instruction[]): Map<number, Lens[]> => {
  const map = new Map<number, Lens[]>();
  instructions.forEach((instr) => applyInstruction(map, instr));
  return map;
};

const computeFocusingPower = (map: Map<number, Lens[]>): number => {
  return [...map.entries()].reduce(
    (acc, [box, lenses]) =>
      acc +
      lenses.reduce(
        (acc1, lens, index) =>
          acc1 + (box + 1) * (index + 1) * lens.focalLength,
        0,
      ),
    0,
  );
};
