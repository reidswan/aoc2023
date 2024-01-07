import _ from "lodash";
import { filterMap, isNumeric, readInputLines, cachedFn } from "../utils";

export const solve = () => {
  const lines = readInputLines("input/day12.txt");
  const input = parseInput(lines);
  let total = input.reduce(
    (acc, record) => acc + countPossibleConditions(record),
    0,
  );
  console.log("Part 1:", total);

  total = input.reduce(
    (acc, record) => acc + countPossibleConditions(unfoldRecord(record)),
    0,
  );
  console.log("Part 2:", total);
};

type ConditionRecord = {
  conditions: Condition[];
  brokenSpringAudit: number[];
};

enum Condition {
  Working = ".",
  Broken = "#",
  Unknown = "?",
}

const parseInput = (src: string[]): ConditionRecord[] => {
  return src.map((line) => {
    const [conditions, brokenSprings] = line.split(" ");
    return {
      conditions: conditions.split("").map((c) => {
        switch (c) {
          case ".":
            return Condition.Working;
          case "#":
            return Condition.Broken;
          case "?":
            return Condition.Unknown;
        }
        throw new Error(`unknown condition: ${c}`);
      }),
      brokenSpringAudit: brokenSprings
        .split(",")
        .filter(isNumeric)
        .map((it) => parseInt(it)),
    };
  });
};

const unfoldRecord = (record: ConditionRecord): ConditionRecord => {
  return {
    conditions: [
      ...record.conditions,
      Condition.Unknown,
      ...record.conditions,
      Condition.Unknown,
      ...record.conditions,
      Condition.Unknown,
      ...record.conditions,
      Condition.Unknown,
      ...record.conditions,
    ],
    brokenSpringAudit: [
      ...record.brokenSpringAudit,
      ...record.brokenSpringAudit,
      ...record.brokenSpringAudit,
      ...record.brokenSpringAudit,
      ...record.brokenSpringAudit,
    ],
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const countPossibleConditionsBrute = (record: ConditionRecord): number => {
  let count = 0;
  const unknowns = filterMap(record.conditions, (it, i) => {
    if (it === Condition.Unknown) return i;
  });

  for (let exp = 0; exp < Math.pow(2, unknowns.length); exp++) {
    const recordPerm = {
      brokenSpringAudit: record.brokenSpringAudit,
      conditions: [...record.conditions],
    };

    unknowns.forEach((condIx, i) => {
      if ((exp >>> i) % 2) {
        recordPerm.conditions[condIx] = Condition.Broken;
      } else {
        recordPerm.conditions[condIx] = Condition.Working;
      }
    });

    if (matches(recordPerm)) {
      count++;
    }
  }
  return count;
};

const countPossibleConditions = cachedFn(
  ({ brokenSpringAudit, conditions }: ConditionRecord): number => {
    if (brokenSpringAudit.length === 0) {
      if (conditions.every((c) => c !== Condition.Broken)) {
        // Rest are Working springs
        return 1;
      }
      // There is some unmatched broken spring remaining
      return 0;
    } else if (conditions.length === 0) {
      // We have remaining runs, but nothing for them to consume
      return 0;
    }

    const [run, ...rest] = brokenSpringAudit;
    if (conditions.length < run) {
      // The run cannot fit in the remaining conditions
      return 0;
    }

    switch (_.head(conditions)!) {
      case Condition.Working:
        // No match here; skip until we hit a possible match
        return countPossibleConditions({
          conditions: _.dropWhile(conditions, (it) => it === Condition.Working),
          brokenSpringAudit,
        });
      case Condition.Broken:
        if (
          conditions.slice(0, run).every((it) => it !== Condition.Working) &&
          conditions[run] !== Condition.Broken
        ) {
          // A match, followed by a separator!
          return countPossibleConditions({
            conditions: conditions.slice(run + 1),
            brokenSpringAudit: rest,
          });
        }
        return 0;
      case Condition.Unknown:
        // Try both options
        return (
          countPossibleConditions({
            conditions: [Condition.Broken, ...conditions.slice(1)],
            brokenSpringAudit,
          }) +
          countPossibleConditions({
            conditions: conditions.slice(1),
            brokenSpringAudit,
          })
        );
    }
  },
);

const matches = (record: ConditionRecord): boolean => {
  type result = { runs: number[]; currentCount: number };

  const { runs, currentCount } = record.conditions.reduce(
    (acc: result, curr): result => {
      if (curr === Condition.Broken) {
        acc.currentCount++;
      } else if (acc.currentCount != 0) {
        acc.runs.push(acc.currentCount);
        acc.currentCount = 0;
      }

      return acc;
    },
    { runs: [], currentCount: 0 },
  );

  if (currentCount != 0) {
    runs.push(currentCount);
  }

  if (runs.length !== record.brokenSpringAudit.length) return false;

  return runs.every((run, i) => run === record.brokenSpringAudit[i]);
};
