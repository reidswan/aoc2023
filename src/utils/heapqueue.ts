export class HeapQueue<T> {
  private heap: T[] = [];
  private currentSize: number = 0;
  private lessThan: (a: T, b: T) => boolean;

  constructor(lessThan: (a: T, b: T) => boolean) {
    this.lessThan = lessThan;
  }

  enqueue(it: T) {
    this.currentSize++;
    this.heap[this.currentSize - 1] = it;
    let curr = this.currentSize - 1;
    let parent = getParent(curr);
    while (curr > 0 && this.lessThan(this.heap[curr], this.heap[parent])) {
      this.swap(curr, parent);
      curr = parent;
      parent = getParent(curr);
    }
  }

  dequeue(): T | undefined {
    if (this.currentSize === 0) {
      return undefined;
    }

    this.currentSize--;
    const min = this.heap[0];
    this.heap[0] = this.heap[this.currentSize];
    delete this.heap[this.currentSize];

    if (this.currentSize > 1) {
      this.heapify(0);
    }

    return min;
  }

  private heapify(fromIndex: number) {
    const leftChildIx = getLeftChild(fromIndex);
    const rightChildIx = getRightChild(fromIndex);

    let smallest = fromIndex;

    if (
      leftChildIx < this.currentSize &&
      this.lessThan(this.heap[leftChildIx], this.heap[smallest])
    ) {
      smallest = leftChildIx;
    }

    if (
      rightChildIx < this.currentSize &&
      this.lessThan(this.heap[rightChildIx], this.heap[smallest])
    ) {
      smallest = rightChildIx;
    }

    if (smallest !== fromIndex) {
      this.swap(fromIndex, smallest);
      this.heapify(smallest);
    }
  }

  size(): number {
    return this.currentSize;
  }

  private swap(indexA: number, indexB: number) {
    const temp = this.heap[indexA];
    this.heap[indexA] = this.heap[indexB];
    this.heap[indexB] = temp;
  }
}

const getParent = (i: number): number => {
  return Math.floor((i - 1) / 2);
};

const getLeftChild = (i: number): number => {
  return 2 * i + 1;
};

const getRightChild = (i: number): number => {
  return 2 * i + 2;
};
