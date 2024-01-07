import _ from "lodash";
import { Coord, Map_, Set, get, hashCoord, readInputGrid } from "../utils";

export const solve = () => {
  const map = parseInput(readInputGrid("input/day23.txt"));

  const startX = map[0].findIndex((it) => it === TileType.Path);
  const endX = map[map.length - 1].findIndex((it) => it === TileType.Path);
  if (startX === -1 || endX === -1) {
    throw new Error("start or end tile not found");
  }

  const start = { y: 0, x: startX };
  const end = { y: map.length - 1, x: endX };

  console.log("Part 1:", longestPathP1(map, start, end));
  console.log("Part 2:", longestPathP2(map, start, end));
};

enum TileType {
  Path = ".",
  Forest = "#",
  UpSlope = "^",
  DownSlope = "v",
  LeftSlope = "<",
  RightSlope = ">",
}

export const parseInput = (src: string[][]): TileType[][] => {
  return src.map((row) =>
    row.map((c) => {
      if (".#^v<>".includes(c)) {
        return c as TileType;
      }
      throw new Error(`unrecognized tile: ${c}`);
    }),
  );
};

const longestPathP1 = (map: TileType[][], start: Coord, end: Coord): number => {
  const queue = [
    { loc: start, dist: 0, path: new Set<Coord>(hashCoord).add(start) },
  ];
  const mb: number[] = [];

  while (queue.length) {
    const { loc, dist, path } = queue.pop()!;

    if (_.isEqual(loc, end)) {
      mb.push(dist);
      continue;
    }

    const nexts = nextTiles(map, loc, path);
    if (nexts.length === 1) {
      queue.push({ loc: nexts[0], path: path.add(loc), dist: dist + 1 });
    } else {
      queue.push(
        ...nexts.map((next) => ({
          loc: next,
          path: path.clone().add(loc),
          dist: dist + 1,
        })),
      );
    }
  }

  return Math.max(...mb);
};

const neighbours = ({ x, y }: Coord): Coord[] => {
  return [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ];
};

const nextTiles = (
  map: TileType[][],
  { x, y }: Coord,
  path: Set<Coord>,
): Coord[] => {
  const tile = get(map, { x, y });
  if (tile === undefined) return [];

  let nexts;
  switch (tile) {
    case TileType.Forest:
      throw new Error(`should not be in a forest tile (${x}, ${y})`);
    case TileType.Path:
      nexts = neighbours({ x, y });
      break;
    case TileType.UpSlope:
      nexts = [{ x, y: y - 1 }];
      break;
    case TileType.DownSlope:
      nexts = [{ x, y: y + 1 }];
      break;
    case TileType.LeftSlope:
      nexts = [{ x: x - 1, y }];
      break;
    case TileType.RightSlope:
      nexts = [{ x: x + 1, y }];
      break;
  }

  return nexts.filter((it) => {
    if (path.has(it)) return false;

    const next = get(map, it);
    return next !== undefined && next !== TileType.Forest;
  });
};

const longestPathP2 = (map: TileType[][], start: Coord, end: Coord): number => {
  const { nodes, edges } = pathGraph(map);
  edges.items().forEach(([from, tos]) => {
    const fromCoord = nodes.get(from)!;
    console.log(`(${fromCoord.x}, ${fromCoord.y}) => [`);
    tos.forEach((to) => {
      const toCoord = nodes.get(to.to)!;
      console.log(`  (${toCoord.x}, ${toCoord.y}) [${to.dist}]`);
    });
    console.log("]");
  });

  const startID = nodes.items().find(([, val]) => _.isEqual(start, val))![0];
  const endID = nodes.items().find(([, val]) => _.isEqual(end, val))![0];
  const queue = [
    {
      curr: startID,
      dist: 0,
      visited: new Set<NodeID>((x) => x.toString()).add(startID),
    },
  ];
  let maxDist = 0;
  while (queue.length) {
    const { curr, dist, visited } = queue.pop()!;
    if (curr === endID) {
      maxDist = Math.max(maxDist, dist + visited.count());
      continue;
    }

    edges
      .get(curr)!
      .filter((a) => !visited.has(a.to))
      .forEach(({ to, dist: dist_ }) => {
        queue.push({
          curr: to,
          dist: dist + dist_,
          visited: visited.clone().add(curr),
        });
      });
  }

  return maxDist;
};

type NodeID = number;

const pathGraph = (
  map: TileType[][],
): {
  nodes: Map_<NodeID, Coord>;
  edges: Map_<NodeID, { to: NodeID; dist: number }[]>;
} => {
  const visited = new Set<Coord>(hashCoord);
  const nodes = new Map_<NodeID, Coord>((n) => n.toString());
  const edges = new Map_<NodeID, { to: NodeID; dist: number }[]>((n) =>
    n.toString(),
  );
  map.forEach((row, y) =>
    row.forEach((elm, x) => {
      if (elm === TileType.Forest) return;
      if (visited.has({ x, y })) return;
      visited.add({ x, y });

      const nb = neighbours({ x, y }).filter((coord) => {
        const t = get(map, coord);
        return t !== undefined && t !== TileType.Forest;
      });

      if (nb.length !== 2) return;

      const [left, right] = nb;

      let dist = 1;
      let start = left;
      let prev = { x, y };
      let nexts = neighbours(left).filter((coord) => {
        if (_.isEqual(coord, prev)) return false;
        const t = get(map, coord);
        return t !== undefined && t !== TileType.Forest;
      });
      while (nexts.length === 1) {
        dist++;
        visited.add(start);
        prev = start;
        start = nexts[0];
        nexts = neighbours(start).filter((coord) => {
          if (_.isEqual(coord, prev)) return false;
          const t = get(map, coord);
          return t !== undefined && t !== TileType.Forest;
        });
      }

      let end = right;
      prev = { x, y };
      nexts = neighbours(right).filter((coord) => {
        if (_.isEqual(coord, prev)) return false;
        const t = get(map, coord);
        return t !== undefined && t !== TileType.Forest;
      });
      while (nexts.length === 1) {
        dist++;
        visited.add(end);
        prev = end;
        end = nexts[0];
        nexts = neighbours(end).filter((coord) => {
          if (_.isEqual(coord, prev)) return false;
          const t = get(map, coord);
          return t !== undefined && t !== TileType.Forest;
        });
      }

      const startNodeEntry = nodes.items().find(([, v]) => _.isEqual(v, start));
      let startNodeID: NodeID;
      if (!startNodeEntry) {
        startNodeID = nodes.count();
        nodes.add(startNodeID, start);
      } else {
        startNodeID = startNodeEntry[0];
      }

      const endNodeEntry = nodes.items().find(([, v]) => _.isEqual(v, end));
      let endNodeID: NodeID;
      if (!endNodeEntry) {
        endNodeID = nodes.count();
        nodes.add(endNodeID, end);
      } else {
        endNodeID = endNodeEntry[0];
      }

      if (!edges.has(startNodeID)) {
        edges.add(startNodeID, []);
      }

      if (!edges.has(endNodeID)) {
        edges.add(endNodeID, []);
      }

      edges.get(startNodeID)!.push({ to: endNodeID, dist });
      edges.get(endNodeID)!.push({ to: startNodeID, dist });
    }),
  );

  return { nodes, edges };
};
