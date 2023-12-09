import _ from "lodash"
import { readInputLines } from "../utils"

export const solve = () => {
    const lines = readInputLines("input/day07.txt")
    const hands = lines.map(parseHand);
    hands.sort(cmpHands(cardRank))

    let result = hands.map((h, i) => h.bid * (i + 1)).reduce((acc, it) => acc + it)

    console.log("Part 1:", result)

    hands.forEach(hand => hand.type = determineHandType(hand.cards, s => s === "J"))
    hands.sort(cmpHands(cardRankP2))

    result = hands.map((h, i) => h.bid * (i + 1)).reduce((acc, it) => acc + it)

    console.log("Part 2:", result)
}

type Hand = {
    cards: string[]
    bid: number
    type: HandType
}

const parseHand = (s: string): Hand => {
    const [cardsS, bid] = s.split(" ")
    const cards = [...cardsS]

    return {
        cards,
        bid: parseInt(bid),
        type: determineHandType(cards),
    }
}

enum HandType {
    FiveOfAKind = 7,
    FourOfAKind = 6,
    FullHouse = 5,
    ThreeOfAKind = 4,
    TwoPair = 3,
    OnePair = 2,
    HighCard = 1,
}

const cardRank = (s: string): number => {
    switch (s) {
        case 'A':
            return 13
        case 'K':
            return 12
        case 'Q':
            return 11
        case 'J':
            return 10
        case 'T':
            return 9
    }

    const val = parseInt(s)
    if (isNaN(val) || val < 2 || val > 9) {
        throw new Error(`unexpected value for card: ${s}`)
    }

    return val - 1
}

const cardRankP2 = (s: string): number => {
    switch (s) {
        case 'A':
            return 13
        case 'K':
            return 12
        case 'Q':
            return 11
        case 'T':
            return 10
        case 'J':
            return 1
    }

    const val = parseInt(s)
    if (isNaN(val) || val < 2 || val > 9) {
        throw new Error(`unexpected value for card: ${s}`)
    }

    return val
}

const cmpHands = (cardRank: (s: string) => number) => (hand1: Hand, hand2: Hand): number => {
    if (hand1.type > hand2.type) {
        return 1
    } else if (hand2.type > hand1.type) {
        return -1
    }

    const firstNonMatch = _.zip(hand1.cards, hand2.cards).find(([a, b]) => a !== b);
    if (firstNonMatch === undefined) {
        return 0
    }

    const [c1, c2] = firstNonMatch;

    return cardRank(c1 as string) - cardRank(c2 as string)
}

const determineHandType = (cards: string[], isJoker?: (s: string) => boolean): HandType => {
    if (isJoker === undefined) {
        isJoker = () => false
    }

    const [jokers, rest] = _.partition(cards, isJoker)
    const jokerCount = jokers.length;

    if (rest.length === 0) {
        // Edge case: everything is a joker!
        return HandType.FiveOfAKind
    }

    const groups = _.groupBy(rest, it => it);
    const keys = _.keys(groups);
    const vals = _.values(groups)

    if (keys.length === 1) {
        return HandType.FiveOfAKind
    }

    if (vals.some(it => it.length + jokerCount === 4)) {
        return HandType.FourOfAKind
    }

    if (vals.some(it => it.length + jokerCount === 3)) {
        if (keys.length === 2) {
            return HandType.FullHouse
        } else {
            return HandType.ThreeOfAKind
        }
    }

    const pairCounts = vals.filter(it => it.length === 2).length
    if (pairCounts === 2) {
        return HandType.TwoPair
    } else if (pairCounts === 1) {
        return HandType.OnePair
    }

    if (jokerCount > 0) {
        return HandType.OnePair
    }

    return HandType.HighCard
}