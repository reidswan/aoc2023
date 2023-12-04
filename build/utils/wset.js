"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WSet {
    constructor(values) {
        this.set = new Set(values);
    }
    has(it) {
        return this.set.has(it);
    }
    add(it) {
        this.set.add(it);
    }
    size() {
        return this.set.size;
    }
    clear() {
        this.set.clear();
    }
    delete(it) {
        return this.set.delete(it);
    }
    forEach(callbackfn) {
        return this.set.forEach(callbackfn);
    }
    intersection(other) {
        const res = new WSet();
        for (const it of this.set) {
            if (other.has(it)) {
                res.add(it);
            }
        }
        return res;
    }
    union(other) {
        const res = new WSet();
        for (const it of this.set) {
            res.add(it);
        }
        for (const it of other) {
            res.add(it);
        }
        return res;
    }
    [Symbol.iterator]() {
        return this.set.values();
    }
    map(fn) {
        const res = new WSet();
        for (const it of this) {
            res.add(fn(it));
        }
        return res;
    }
    filter(predicate) {
        const res = new WSet;
        for (const it of this) {
            if (predicate(it)) {
                res.add(it);
            }
        }
        return res;
    }
    reduce(accumulator, initialValue) {
        let res = initialValue;
        for (const it of this) {
            res = accumulator(res, it);
        }
        return res;
    }
}
exports.default = WSet;
