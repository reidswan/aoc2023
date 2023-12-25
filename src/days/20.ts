import _ from "lodash"
import { leastCommonMultiple, readInputLines } from "../utils"

export const solve = () => {
    const input = parseInput(readInputLines("input/day20.txt"))
    const totals = _.range(1000).reduce(totals => {
        const counts = handleButtonPress(input)
        totals[PulseType.High] += counts[PulseType.High]
        totals[PulseType.Low] += counts[PulseType.Low]
        return totals
    }, { [PulseType.High]: 0, [PulseType.Low]: 0 })

    console.log("Part 1:", totals[PulseType.High] * totals[PulseType.Low])

    console.log("Part 2:", findRxCycleLength(input))
}

enum PulseType {
    Low = 0,
    High = 1,
}

enum ModuleType {
    FlipFlop = "flip-flop",
    Conjunction = "conjuction",
    Broadcaster = "broadcaster",
}

type FlipFlopModule = {
    type: ModuleType.FlipFlop,
    state: "on" | "off",
}

type ConjunctionModule = {
    type: ModuleType.Conjunction,
    memory: { [key: string]: PulseType }
}

type BroadCasterModule = {
    type: ModuleType.Broadcaster,
}

type Module = (FlipFlopModule | ConjunctionModule | BroadCasterModule) & { name: string }

type ModuleGraph = {
    [key: string]: {
        module: Module,
        incomingEdges: string[],
        outgoingEdges: string[],
    }
}

const parseInput = (lines: string[]): ModuleGraph => {
    const graph: ModuleGraph = {}

    for (const line of lines) {
        const [name, edges] = line.split("->")
        const module = parseModuleFromName(name)
        const outgoingEdges = edges.split(",").map(name => name.trim())

        graph[module.name] = { module, outgoingEdges, incomingEdges: [] }
    }

    for (const mod of _.values(graph)) {
        for (const edge of mod.outgoingEdges) {
            const inMod = graph[edge]
            if (inMod !== undefined) {
                inMod.incomingEdges.push(mod.module.name)

                if (inMod.module.type === ModuleType.Conjunction) {
                    inMod.module.memory[mod.module.name] = PulseType.Low
                }
            }
        }
    }

    return graph
}

const parseModuleFromName = (name: string): Module => {
    name = name.trim()

    if (name === "broadcaster") {
        return {
            type: ModuleType.Broadcaster,
            name: "broadcaster",
        }
    }

    if (name.startsWith("%")) {
        return {
            type: ModuleType.FlipFlop,
            state: "off",
            name: name.replace("%", "")
        }
    }

    if (name.startsWith("&")) {
        return {
            type: ModuleType.Conjunction,
            memory: {},
            name: name.replace("&", "")
        }
    }

    throw new Error(`Cannot determine module from name: ${name}`)
}

const handleButtonPress = (modGraph: ModuleGraph): { [key in PulseType]: number } => {
    const counts = {
        [PulseType.Low]: 0,
        [PulseType.High]: 0
    }

    const queue: { modName: string, incomingPulse: PulseType, from: string }[] = [{
        modName: "broadcaster",
        incomingPulse: PulseType.Low,
        from: "button",
    }]

    while (queue.length) {
        const { modName, incomingPulse, from } = queue.pop()!
        counts[incomingPulse]++

        const module = modGraph[modName]
        if (module === undefined) continue

        const resultPulse = handlePulse(module.module, from, incomingPulse)
        if (resultPulse !== undefined) {
            queue.push(...module.outgoingEdges.map(edge => ({ modName: edge, incomingPulse: resultPulse, from: modName })))
        }
    }

    return counts
}

const handlePulse = (module: Module, fromModule: string, pulseType: PulseType): PulseType | undefined => {
    switch (module.type) {
        case ModuleType.FlipFlop:
            if (pulseType === PulseType.High) {
                return undefined
            }

            if (module.state === "on") {
                module.state = "off"
                return PulseType.Low
            } else {
                module.state = "on"
                return PulseType.High
            }

        case ModuleType.Conjunction:
            module.memory[fromModule] = pulseType
            if (_.values(module.memory).every(pt => pt === PulseType.High)) {
                return PulseType.Low
            }
            return PulseType.High

        case ModuleType.Broadcaster:
            return pulseType
    }
}

const reset = (modGraph: ModuleGraph) => {
    _.values(modGraph).forEach(mod => {
        if (mod.module.type === ModuleType.FlipFlop) {
            mod.module.state = "off";
        } else if (mod.module.type === ModuleType.Conjunction) {
            const module = mod.module;
            _.keys(module.memory).forEach(k => module.memory[k] = PulseType.Low)
        }
    })
}

const findCycleLength = (modGraph: ModuleGraph, seek: string): number => {
    reset(modGraph)
    let count = 0

    // eslint-disable-next-line no-constant-condition
    while (true) {
        count++

        const queue: { modName: string, incomingPulse: PulseType, from: string }[] = [{
            modName: "broadcaster",
            incomingPulse: PulseType.Low,
            from: "button",
        }]

        while (queue.length) {
            const { modName, incomingPulse, from } = queue.shift()!

            const module = modGraph[modName]
            if (module === undefined) continue

            const resultPulse = handlePulse(module.module, from, incomingPulse)
            if (resultPulse !== undefined) {
                queue.push(...module.outgoingEdges.map(edge => ({ modName: edge, incomingPulse: resultPulse, from: modName })))
            }

            if (modName === seek && resultPulse === PulseType.High) {
                return count
            }
        }
    }
}

const findRxCycleLength = (modGraph: ModuleGraph): number => {
    const finalConj = _.values(modGraph).find(it => it.outgoingEdges.includes("rx"))!

    return finalConj.incomingEdges.map(e => findCycleLength(modGraph, e)).reduce(leastCommonMultiple)
}
