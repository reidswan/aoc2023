"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSet = exports.readInputLines = exports.readInput = void 0;
const fs_1 = __importDefault(require("fs"));
const wset_1 = __importDefault(require("./wset"));
exports.WSet = wset_1.default;
const readInput = (path) => {
    return fs_1.default.readFileSync(path).toString();
};
exports.readInput = readInput;
const readInputLines = (path) => {
    const contents = (0, exports.readInput)(path);
    return contents.split("\n");
};
exports.readInputLines = readInputLines;
