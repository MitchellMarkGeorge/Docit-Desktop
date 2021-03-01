import { ProjectVersions, ProjectConfig } from "./types";

export class LRUCache {
  private static instance: LRUCache;
  private head: CacheNode;
  private tail: CacheNode;
  private cacheMap: Map<string, CacheNode>;
  private size: number;
  private constructor(private maxCapacity: number) {
    this.size = 0;
    this.cacheMap = new Map();
  }

  public static getInstance(maxCapacity: number): LRUCache {
    // singleton pattern
    if (!LRUCache.instance) {
      LRUCache.instance = new LRUCache(maxCapacity);
    }

    return LRUCache.instance;
  }

 public get(key: string): CacheValue {
    if (this.cacheMap.has(key)) {
      const node = this.cacheMap.get(key);

      if (node.key === this.head.key) {
        // would not be the same object if doing normal equality
        return node.value;
      }
      const previous = node.previous;
      const next = node.next;

      if (this.tail.key === node.key) {
        // would not be the same object if doing normal equality
        previous.next = null;
        this.tail = previous;
      } else {
        previous.next = next;
        next.previous = previous;
      }

      const oldHead = this.head;
      oldHead.previous = node;
      node.next = oldHead;
      node.previous = null;
      this.head = node;

      return node.value;
    } else {
      return undefined;
    }
  }

  public set(key: string, value: CacheValue) {
    if (this.has(key)) {
      // no duplicates
      throw Error("Key already exists in cache");
    }

    const newNode = new CacheNode(key, value);

    if (this.size === 0) {
      this.head = newNode;
      this.tail = newNode;
      this.size++;
      this.cacheMap.set(key, newNode);
      return;
    }

    if (this.size === this.maxCapacity) {
      this.cacheMap.delete(this.tail.key);
      const newTail = this.tail.previous;
      newTail.next = null;
      this.tail = newTail;
      this.size--;
    }

    const oldHead = this.head;
    oldHead.previous = newNode;
    newNode.next = oldHead;
    this.head = newNode;

    this.cacheMap.set(key, newNode);
    this.size++;
  }

  has(key: string) {
    return this.cacheMap.has(key);
  }
}

class CacheNode {
  previous: CacheNode;
  next: CacheNode;

  constructor(public key: string, public value: CacheValue) {}
}

interface CacheValue {
  versions?: ProjectVersions;
  config?: ProjectConfig;
}
