var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _ttl, _expiresAt, _promise;
const createExpiresAt = (ttl) => {
    const now = new Date();
    now.setMilliseconds(now.getMilliseconds() + ttl);
    return now;
};
export class Cache {
    /**
     * @param ttl The duration from when the value to be cached is retrieved until it expires.
     *
     * @param jitter The actual ttl of cache is the ttl passed in the argument plus a random value whose minimum value is 0 and
     * maximum value is jitter. The default value is `ttl / 60`.
     */
    constructor(ttl = 3600000, jitter) {
        _ttl.set(this, void 0);
        _expiresAt.set(this, void 0);
        _promise.set(this, void 0);
        __classPrivateFieldSet(this, _ttl, ttl + Math.random() * (jitter !== null && jitter !== void 0 ? jitter : ttl / 60));
        __classPrivateFieldSet(this, _expiresAt, createExpiresAt(__classPrivateFieldGet(this, _ttl)));
    }
    get isExpired() {
        return new Date() > this.expiresAt;
    }
    get expiresAt() {
        return __classPrivateFieldGet(this, _expiresAt);
    }
    /**
     * @param initializer This will be called the first time you get it, and the returned value will be cached. It will not be
     * called by get until it expires.
     *
     * @returns If there is a cached value that has not expired, it will be returned immediately. Otherwise, it returns the value
     * resulting from the call to the initializer.
     */
    async get(initializer) {
        if (this.isExpired)
            __classPrivateFieldSet(this, _promise, undefined);
        if (__classPrivateFieldGet(this, _promise) != undefined) {
            try {
                return await __classPrivateFieldGet(this, _promise);
                // eslint-disable-next-line no-empty
            }
            catch { }
        }
        __classPrivateFieldSet(this, _promise, initializer()
            .then((value) => {
            __classPrivateFieldSet(this, _expiresAt, createExpiresAt(__classPrivateFieldGet(this, _ttl)));
            return value;
        })
            .catch((reason) => {
            __classPrivateFieldSet(this, _promise, undefined);
            throw reason;
        }));
        return __classPrivateFieldGet(this, _promise);
    }
}
_ttl = new WeakMap(), _expiresAt = new WeakMap(), _promise = new WeakMap();
//# sourceMappingURL=index.js.map