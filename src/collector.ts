export class Collector<T> implements Iterable<T> {/**
   * The set of elements.
   * @private
   */
  private readonly _set: Set<T> = new Set();

  /**
   * Iterable implementation.
   */
  [Symbol.iterator](): Iterator<T> {
    return this._set[Symbol.iterator]();
  }

  /**
   * Constructor.
   */
  public constructor(set?: Iterable<T>) {
    if (set) {
      this._set = new Set(set);
    }
  }

  /**
   * Add a value.
   * @param value
   */
  public add(value: T): this {
    this._set.add(value);
    return this;
  }

  /**
   * Delete a value.
   * @param value
   */
  public delete(value: T): this {
    this._set.delete(value);
    return this;
  }

  /**
   * Collects elements that satisfy a specified condition.
   * @param predicate
   */
  public collect(predicate: (value: T) => boolean): Collector<T> {
    const arr = [];

    for (const value of this._set) {
      if (predicate(value)) arr.push(value);
    }

    return new Collector<T>(arr);
  }

  /**
   * Find an element that satisfy a specified condition.
   * @param predicate
   */
  public find(predicate: (value: T) => boolean): T | null {
    for (const value of this._set) {
      if (predicate(value)) return value;
    }

    return null;
  }

  /**
   * Foreach function.
   * @param cb
   */
  public forEach(cb: (value: T) => void): this {
    for (const element of this._set) {
      cb(element);
    }
    return this
  }
}