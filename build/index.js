"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const day01 = __importStar(require("./day01"));
const day02 = __importStar(require("./day02"));
const day03 = __importStar(require("./day03"));
const day04 = __importStar(require("./day04"));
const day05 = __importStar(require("./day05"));
const days = {
    "1": day01,
    "2": day02,
    "3": day03,
    "4": day04,
    "5": day05,
};
const possibleDays = Object.keys(days);
const dayToRun = () => {
    if (process.argv.length >= 3) {
        return process.argv[2];
    }
    // Default to last day in the object
    return possibleDays[possibleDays.length - 1];
};
const day = dayToRun();
if (!possibleDays.includes(day)) {
    console.error(`Unrecognized day: ${day}`);
}
else {
    console.log(`==== Day ${day} ====`);
    days[day].solve();
}
