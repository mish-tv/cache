type TTL = number | "infinity";
type ExpiresAt = Date | "never";

const createExpiresAt = (ttl: TTL): ExpiresAt => {
  if (ttl === "infinity") return "never";
  const now = new Date();
  now.setMilliseconds(now.getMilliseconds() + ttl);

  return now;
};

export class Cache<T> {
  #ttl: TTL;
  #expiresAt: ExpiresAt;
  #promise: Nullable<Promise<T>>;

  /**
   * @param ttl The duration from when the value to be cached is retrieved until it expires. If "infinity" is specified, it will
   * not expire.
   *
   * @param jitter The actual ttl of cache is the ttl passed in the argument plus a random value whose minimum value is 0 and
   * maximum value is jitter. The default value is `ttl / 10`. If ttl is "inifinity", jitter is ignored.
   *
   * @param initial The initial value of the cache can be specified.
   */
  constructor(ttl: TTL = 3600000, jitter?: number, initial?: T) {
    this.#ttl = (() => {
      if (ttl === "infinity") return "infinity";

      return ttl + Math.random() * (jitter ?? ttl / 10);
    })();
    this.#expiresAt = createExpiresAt(this.#ttl);
    this.#promise = (() => {
      if (initial == undefined) return undefined;

      return Promise.resolve(initial);
    })();
  }

  get isExpired() {
    if (this.expiresAt === "never") return false;

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
