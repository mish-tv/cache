const createExpiresAt = (ttl: number) => {
  const now = new Date();
  now.setMilliseconds(now.getMilliseconds() + ttl);

  return now;
};

export class Cache<T> {
  #ttl: number;
  #expiresAt: Date;
  #promise: Nullable<Promise<T>>;

  /**
   * @param ttl The duration from when the value to be cached is retrieved until it expires.
   *
   * @param jitter The actual ttl of cache is the ttl passed in the argument plus a random value whose minimum value is 0 and
   * maximum value is jitter. The default value is `ttl / 10`.
   */
  constructor(ttl = 3600000, jitter?: number) {
    this.#ttl = ttl + Math.random() * (jitter ?? ttl / 10);
    this.#expiresAt = createExpiresAt(this.#ttl);
  }

  get isExpired() {
    return new Date() > this.expiresAt;
  }

  get expiresAt() {
    return this.#expiresAt;
  }

  /**
   * @param initializer This will be called the first time you get it, and the returned value will be cached. It will not be
   * called by get until it expires.
   *
   * @returns If there is a cached value that has not expired, it will be returned immediately. Otherwise, it returns the value
   * resulting from the call to the initializer.
   */
  async get(initializer: () => Promise<T>) {
    if (this.isExpired) this.#promise = undefined;
    if (this.#promise != undefined) {
      try {
        return await this.#promise;
        // eslint-disable-next-line no-empty
      } catch {}
    }
    this.#promise = initializer()
      .then((value) => {
        this.#expiresAt = createExpiresAt(this.#ttl);

        return value;
      })
      .catch((reason) => {
        this.#promise = undefined;
        throw reason;
      });

    return this.#promise;
  }

  invalidate() {
    this.#promise = undefined;
  }
}
