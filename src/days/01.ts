import _ from "lodash";
import { readInputLines } from "../utils";

export const solve = () => {
  const lines = readInputLines("input/day01.txt").filter(
    (line) => line.length > 0,
  );

  const sum = lines
    .map((line) => findNumber(line, filterDigits))
    .reduce((acc, i) => acc + i);

  console.log("Part 1: ", sum);

  const sum2 = lines
    .map((line) => findNumber(line, filterWordyDigits))
    .reduce((acc, i) => acc + i);

  console.log("Part 2: ", sum2);
};

const digits = "0123456789";
const wordyDigits = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  zero: 0,
};

const filterDigits = (s: string): number[] => {
  return [...s].filter((c) => digits.includes(c)).map((c) => parseInt(c));
};

const findNumber = (
  s: string,
  digitFilter: (s: string) => number[],
): number => {
  const digits = digitFilter(s);
  if (digits.length == 0) {
    throw new Error(`no digits in string ${s}`);
  }

  return 10 * digits[0] + digits[digits.length - 1];
};

const digitWordStartingAt = (s: string, i: number): number | undefined => {
  const found =
    _.entries(wordyDigits).find(([digitWord]) =>
      s.substring(i).startsWith(digitWord),
    ) || [];

  return found[1];
};

const filterWordyDigits = (s: string): number[] => {
  return _.range(s.length)
    .map((i) => {
      if (digits.includes(s.charAt(i))) {
        return parseInt(s.charAt(i));
      } else {
        return digitWordStartingAt(s, i);
      }
    })
    .filter((it) => it !== undefined) as number[];
};
