class WSet<T> {
    set: Set<T>

    constructor(values?: T[]) {
        this.set = new Set(values)
    }

    has(it: T): boolean {
        return this.set.has(it)
    }

    add(it: T) {
        this.set.add(it)
    }

    size(): number {
        return this.set.size
    }

    clear() {
        this.set.clear()
    }

    delete(it: T): boolean {
        return this.set.delete(it)
    }

    forEach(callbackfn: (value: T) => void): void {
        return this.set.forEach(callbackfn)
    }

    intersection(other: WSet<T>): WSet<T> {
        const res: WSet<T> = new WSet();

        for (const it of this.set) {
            if (other.has(it)) {
                res.add(it)
            }
        }

        return res
    }

    union(other: WSet<T>): WSet<T> {
        const res: WSet<T> = new WSet();

        for (const it of this.set) {
            res.add(it)
        }

        for (const it of other) {
            res.add(it)
        }

        return res
    }

    [Symbol.iterator]() {
        return this.set.values()
    }

    map<U>(fn: (it: T) => U): WSet<U> {
        const res = new WSet<U>();

        for (const it of this) {
            res.add(fn(it))
        }

        return res;
    }

    filter(predicate: (it: T) => boolean): WSet<T> {
        const res = new WSet<T>;

        for (const it of this) {
            if (predicate(it)) {
                res.add(it)
            }
        }

        return res
    }

    reduce<U>(accumulator: (acc: U, next: T) => U, initialValue: U): U {
        let res = initialValue;

        for (const it of this) {
            res = accumulator(res, it);
        }

        return res
    }
}


export default WSet;