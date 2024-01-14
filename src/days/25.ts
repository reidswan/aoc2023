import _ from "lodash";
import { readInputLines } from "../utils";

export const solve = () => {
  const graph = parseInput(readInputLines("input/day25.txt"));
  let g2 = graph;
  do {
    g2 = _.cloneDeep(graph);
    while (Object.keys(g2).length > 2) {
      randomContractGraph(g2);
    }
  } while (Object.values(g2).every((it) => it.length !== 3));

  const prod = Object.keys(g2)
    .map((it) => it.split(",").length)
    .reduce(_.multiply, 1);
  console.log("Part 1:", prod);
};

type Graph = Record<string, string[]>;
type Edge = [string, string];

const parseInput = (lines: string[]): Graph => {
  const g: Graph = {};

  const upsertConnections = (src: string, targets: string[]) => {
    if (g[src] === undefined) {
      g[src] = targets;
    } else {
      g[src].push(...targets);
    }
  };

  lines.forEach((line) => {
    const [src, tgt] = line.split(":").map((it) => it.trim());
    if (tgt === undefined) throw new Error(`invalid format: '${line}'`);

    const targets = tgt.split(" ");
    upsertConnections(src, targets);
    targets.forEach((target) => upsertConnections(target, [src]));
  });

  return g;
};

const randomContractGraph = (g: Graph) => {
  const edges = getEdges(g);
  const randEdge = edges[_.random(edges.length - 1)];
  if (!randEdge) {
    throw new Error(`no edges in ${JSON.stringify(g, null, 2)}`);
  }

  const [v1, v2] = randEdge;
  const newNodeName = randEdge.join();
  const newNeighbours = [...g[v1], ...g[v2]].filter(
    (it) => it !== v1 && it !== v2,
  );
  delete g[v1];
  delete g[v2];
  for (const neighbor of newNeighbours) {
    g[neighbor] = [
      newNodeName,
      ...g[neighbor].filter((it) => it !== v1 && it !== v2),
    ];
  }
  g[newNodeName] = newNeighbours;
};

const getEdges = (g: Graph): Edge[] => {
  return Object.keys(g)
    .map((v1) => g[v1].map((v2) => [v1, v2] as Edge))
    .flat();
};
