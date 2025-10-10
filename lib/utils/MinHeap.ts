type PQItem = { k: string; f: number };

export class MinHeap {
  arr: PQItem[] = [];

  push(it: PQItem) {
    this.arr.push(it);
    this.up(this.arr.length - 1);
  }

  pop(): PQItem | undefined {
    if (!this.arr.length) return;
    const top = this.arr[0];
    const last = this.arr.pop()!;
    if (this.arr.length) {
      this.arr[0] = last;
      this.down(0);
    }
    return top;
  }

  up(i: number) {
    while (i) {
      const p = (i - 1) >> 1;
      if (this.arr[p].f <= this.arr[i].f) break;
      [this.arr[p], this.arr[i]] = [this.arr[i], this.arr[p]];
      i = p;
    }
  }

  down(i: number) {
    for (; ;) {
      let l = i * 2 + 1, r = l + 1, s = i;
      if (l < this.arr.length && this.arr[l].f < this.arr[s].f) s = l;
      if (r < this.arr.length && this.arr[r].f < this.arr[s].f) s = r;
      if (s === i) break;
      [this.arr[s], this.arr[i]] = [this.arr[i], this.arr[s]];
      i = s;
    }
  }
}
