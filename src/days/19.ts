import _ from "lodash"
import { readInput } from "../utils"

export const solve = () => {
    const input = parseInput(readInput("input/day19.txt"))

    const accepted = input.components
        .filter(component => runThroughWorkflows(component, input.workflows) === FinalResult.Accept)

    const propertySum = accepted.map(c => c["x"] + c["m"] + c["a"] + c["s"]).reduce(_.add)
    console.log("Part 1:", propertySum)

    const acceptedCombos = findAcceptedRanges(input.workflows).map(calculateRangeSize).reduce(_.add, 0)
    console.log("Part 2:", acceptedCombos)
}

const parseInput = (s: string): { components: Component[], workflows: WorkflowMap } => {
    const parts = s.split("\n\n")
    if (parts.length !== 2) throw new Error("invalid format")

    const [workflowsS, componentsS] = parts;

    const workflows = workflowsS.split("\n").map(parseWorkflow).reduce((wfs, wf) => ({ ...wfs, [wf.id]: wf }), {})
    const components = componentsS.split("\n").map(parseComponent)

    return { workflows, components }
}

const runThroughWorkflows = (component: Component, workflows: WorkflowMap): FinalResult => {
    let currWorkflow = workflows["in"]

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const result = runWorkflow(currWorkflow, component)
        if (result.type === "final") {
            return result.result
        } else {
            currWorkflow = workflows[result.workflowID]
            if (currWorkflow === undefined) {
                throw new Error(`no workflow with ID '${result.workflowID}' found`)
            }
        }
    }
}

const runWorkflow = (workflow: Workflow, component: Component): Result => {
    for (const rule of workflow.rules) {
        const prop = component[rule.property]
        if (evalCondition(prop, rule.condition, rule.threshold)) {
            return rule.result
        }
    }

    return workflow.defaultResult
}

const evalCondition = (lhs: number, condition: Condition, rhs: number): boolean => {
    switch (condition) {
        case Condition.Greater:
            return lhs > rhs
        case Condition.Less:
            return lhs < rhs
    }
}

type WorkflowMap = { [key: string]: Workflow }

enum Property {
    X = "x",
    M = "m",
    A = "a",
    S = "s",
}

type Component = { [key in Property]: number }

enum Condition {
    Greater = ">",
    Less = "<"
}

enum FinalResult {
    Accept = "A",
    Reject = "R",
}

type Result = { type: "final", result: FinalResult } | { type: "workflow", workflowID: string }

type WorkflowRule = {
    property: Property,
    condition: Condition,
    threshold: number,
    result: Result,
}

type Workflow = {
    id: string,
    rules: WorkflowRule[],
    defaultResult: Result,
}

const parseWorkflow = (s: string): Workflow => {
    const [id, rest] = s.split("{")
    const segments = rest.replace("}", "").split(",")
    const defaultS = _.last(segments)!
    const rulesS = segments.slice(0, segments.length - 1)

    return {
        id,
        rules: rulesS.map(parseRule),
        defaultResult: parseResult(defaultS)
    }
}

const parseRule = (s: string): WorkflowRule => {
    const res = /(?<property>[xmas])(?<condition>[<>])(?<threshold>[0-9]+):(?<result>[a-zA-Z]+)/.exec(s)
    if (!res || !res.groups) {
        throw new Error(`unexpected format for rule '${s}'`)
    }

    return {
        property: res.groups["property"] as Property,
        condition: res.groups["condition"] as Condition,
        result: parseResult(res.groups["result"]),
        threshold: parseInt(res.groups["threshold"])
    }
}

const parseResult = (s: string): Result => {
    if (s === 'A' || s === "R") {
        return { type: "final", result: s as FinalResult }
    }

    return { type: "workflow", workflowID: s }
}

const parseComponent = (s: string): Component => {
    return JSON.parse(s
        .replace("x=", '"x":')
        .replace("m=", '"m":')
        .replace("a=", '"a":')
        .replace("s=", '"s":')) as Component
}

type Range = { min: number, max: number }
type ComponentRange = { [key in Property]: Range }

const findAcceptedRanges = (workflows: WorkflowMap): ComponentRange[] => {
    const accepted: ComponentRange[] = []
    const stack: { componentRange: ComponentRange, workflowID: string }[] = [{
        componentRange: {
            "x": { min: 1, max: 4000 },
            "m": { min: 1, max: 4000 },
            "a": { min: 1, max: 4000 },
            "s": { min: 1, max: 4000 },
        },
        workflowID: "in"
    }]

    const handleResult = (componentRange: ComponentRange, result: Result) => {
        if (result.type === "final" && result.result === FinalResult.Accept) {
            accepted.push(componentRange)
        } else if (result.type === "workflow") {
            stack.push({ workflowID: result.workflowID, componentRange })
        }
    }

    while (stack.length) {
        const { componentRange, workflowID } = stack.pop()!;
        const workflow = workflows[workflowID];
        let currRange = componentRange;

        for (const rule of workflow.rules) {
            if (isEmptyComponentRange(currRange)) {
                break
            }

            const { success, failure } = splitRange(currRange[rule.property], rule.condition, rule.threshold)

            if (!isEmptyRange(success)) {
                handleResult({ ...currRange, [rule.property]: success }, rule.result)
            }

            currRange = { ...currRange, [rule.property]: failure }
        }

        // Handle default
        if (!isEmptyComponentRange(currRange)) {
            handleResult(currRange, workflow.defaultResult)
        }
    }

    return accepted
}

const calculateRangeSize = (componentRange: ComponentRange): number => {
    return Math.max(0,
        _.values(componentRange).map(({ min, max }) => (max - min + 1)).reduce((acc, it) => acc * it, 1))
}

const isEmptyComponentRange = (componentRange: ComponentRange): boolean => {
    return _.values(componentRange).some(isEmptyRange)
}

const isEmptyRange = (range: Range): boolean => {
    return range.min > range.max
}

const splitRange = (range: Range, condition: Condition, threshold: number): { success: Range, failure: Range } => {
    if (condition === Condition.Greater) {
        return { success: { min: threshold + 1, max: range.max }, failure: { min: range.min, max: threshold } }
    } else {
        return { success: { min: range.min, max: threshold - 1 }, failure: { min: threshold, max: range.max } }
    }
} 
