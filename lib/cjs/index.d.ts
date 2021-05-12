export declare class Cache<T> {
    #private;
    /**
     * @param ttl The duration from when the value to be cached is retrieved until it expires.
     *
     * @param jitter The actual ttl of cache is the ttl passed in the argument plus a random value whose minimum value is 0 and
     * maximum value is jitter. The default value is `ttl / 60`.
     */
    constructor(ttl?: number, jitter?: number);
    get isExpired(): boolean;
    get expiresAt(): Date;
    /**
     * @param initializer This will be called the first time you get it, and the returned value will be cached. It will not be
     * called by get until it expires.
     *
     * @returns If there is a cached value that has not expired, it will be returned immediately. Otherwise, it returns the value
     * resulting from the call to the initializer.
     */
    get(initializer: () => Promise<T>): Promise<T>;
}
