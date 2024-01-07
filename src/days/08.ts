import _ from "lodash";
import { leastCommonMultiple, readInput } from "../utils";

export const solve = () => {
  const input = readInput("input/day08.txt");
  const nodeMap = parseInput(input);

  const { count } = traverse(startNode, nodeMap, (it) => it == endNode);
  console.log("Part 1:", count);

  console.log("Part 2:", solveP2(nodeMap));
};

enum Instruction {
  Left,
  Right,
}

type LinkMap = { [key: string]: NodeLink };

type NodeMap = {
  instructions: Instruction[];
  nodes: LinkMap;
};

type NodeLink = {
  left: string;
  right: string;
};

const startNode = "AAA";
const endNode = "ZZZ";

const parseInput = (s: string): NodeMap => {
  const [instructions, nodesRaw] = s.split("\n\n");
  const nodes: LinkMap = {};
  nodesRaw
    .split("\n")
    .filter((it) => it !== "")
    .forEach((line) => {
      const match =
        /(?<name>[0-9A-Z]+)\s*=\s*\((?<left>[0-9A-Z]+),\s*(?<right>[0-9A-Z]+)\)/.exec(
          line,
        );
      if (!match || !match.groups) {
        throw new Error(`unexpected format for line ${line}`);
      }

      nodes[match.groups["name"]] = {
        left: match.groups["left"],
        right: match.groups["right"],
      };
    });

  return {
    instructions: instructions
      .split("")
      .filter((it) => it == "L" || it == "R")
      .map(parseInstruction),
    nodes,
  };
};

const parseInstruction = (i: string): Instruction => {
  if (i == "L") {
    return Instruction.Left;
  }

  return Instruction.Right;
};

const traverse = (
  start: string,
  nodeMap: NodeMap,
  isEnd: (node: string) => boolean,
): { end: string; count: number } => {
  let curr = start;
  let count = 0;
  do {
    const instruction =
      nodeMap.instructions[count % nodeMap.instructions.length];
    curr = move(curr, instruction, nodeMap.nodes);
    count++;
  } while (!isEnd(curr));

  return { end: curr, count };
};

const move = (
  from: string,
  instruction: Instruction,
  nodes: LinkMap,
): string => {
  const link = nodes[from];
  if (instruction == Instruction.Left) {
    return link.left;
  }
  return link.right;
};

const solveP2 = (nodeMap: NodeMap): number => {
  const nodes = _.keys(nodeMap.nodes).filter((it) => it.endsWith("A"));
  const counts = nodes.map(
    (node) => traverse(node, nodeMap, (it) => it.endsWith("Z")).count,
  );

  return counts.reduce(leastCommonMultiple);
};
