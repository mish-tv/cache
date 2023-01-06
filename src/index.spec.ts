import { Cache } from "./index";

const sleepGet = (ms: number, value: number) =>
  new Promise<number>((resolve) => setTimeout(() => resolve(value), ms));
const sleepThrow = (ms: number, message: string) =>
  new Promise<number>((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms)
  );
// eslint-disable-next-line @typescript-eslint/no-empty-function
const sleep = (ms: number) => sleepGet(ms, 0).then(() => {});

describe("Cache", () => {
  let cache: Cache<number>;

  beforeEach(() => {
    cache = new Cache<number>();
  });

  it("should cache the value returned by the initializer.", async () => {
    await expect(() =>
      cache.get(() => {
        throw new Error("error1");
      })
    ).rejects.toThrowError();

    expect(await cache.get(() => Promise.resolve(1))).toBe(1);
    expect(
      await cache.get(() => {
        throw new Error("error1");
      })
    ).toBe(1);
    expect(await cache.get(() => Promise.resolve(3))).toBe(1);
  });

  it("runs in parallel and if it fails, reruns.", async () => {
    expect(
      await Promise.all([
        cache.get(() => sleepThrow(50, "error")).catch((e) => e.toString()),
        cache.get(() => Promise.resolve(1)),
      ])
    ).toEqual(["Error: error", 1]);
  });

  context("If get is called again before it is completed", () => {
    let initializer: () => Promise<number>;

    context("If the first initializer returns an value.", () => {
      beforeEach(() => {
        initializer = () => sleepGet(100, 1);
      });

      it("should use the first initializer to cache the value.", async () => {
        await cache.get(initializer);
        expect(await cache.get(() => Promise.resolve(2))).toBe(1);
      });
    });

    context("If the first initializer throws an exception", () => {
      beforeEach(() => {
        initializer = () => sleepThrow(100, "error1");
      });

      it("should use a new initializer to cache the value.", async () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        cache.get(initializer).catch(() => {});
        expect(await cache.get(() => Promise.resolve(2))).toBe(2);
      });
    });
  });

  context("If ttl is set", () => {
    beforeEach(() => {
      cache = new Cache(90, 0);
    });

    it("should expire according to the configured ttl.", async () => {
      expect(await cache.get(() => sleepGet(100, 1))).toBe(1);
      await sleep(50);
      expect(await cache.get(() => Promise.resolve(2))).toBe(1);
      await sleep(50);
      expect(await cache.get(() => Promise.resolve(3))).toBe(3);
      await sleep(50);
      expect(await cache.get(() => Promise.resolve(4))).toBe(3);
      await sleep(50);
      await expect(() =>
        cache.get(() => {
          throw new Error("error1");
        })
      ).rejects.toThrowError("error1");
      expect(await cache.get(() => Promise.resolve(5))).toBe(5);
    });

    it("gets the value of the first execution if executed in parallel.", async () => {
      expect(
        await Promise.all([
          cache.get(() => sleepGet(50, 1)),
          cache.get(() => sleepGet(50, 2)),
        ])
      ).toEqual([1, 1]);
      await sleep(50);
      expect(await cache.get(() => Promise.resolve(2))).toBe(1);
      await sleep(50);
      expect(
        await Promise.all([
          cache.get(() => sleepGet(50, 3)),
          cache.get(() => sleepGet(50, 4)),
        ])
      ).toEqual([3, 3]);
      expect(await cache.get(() => Promise.resolve(2))).toBe(3);
    });
  });

  context("If ttl is infinity", () => {
    beforeEach(() => {
      cache = new Cache("infinity");
    });

    it("should not expire.", async () => {
      expect(await cache.get(() => Promise.resolve(1))).toBe(1);
      await sleep(1000);
      expect(await cache.get(() => Promise.resolve(2))).toBe(1);
    });
  });

  context("If the initial value is set", () => {
    beforeEach(() => {
      cache = new Cache(90, 0, 1);
    });

    it("should return the initial value until it expires.", async () => {
      expect(await cache.get(() => Promise.resolve(2))).toBe(1);
      await sleep(50);
      expect(await cache.get(() => Promise.resolve(3))).toBe(1);
      await sleep(50);
      expect(await cache.get(() => Promise.resolve(4))).toBe(4);
    });
  });
});

describe("Cache.expiresAt", () => {
  it("should be set randomly by jitter.", () => {
    const result = new Map<number, number>();
    for (let i = 0; i < 1000; i++) {
      const cache = new Cache(1000, 10000);
      const sub = Math.floor(
        ((cache.expiresAt as Date).getTime() - Date.now()) / 1000
      );
      result.set(sub, (result.get(sub) ?? 0) + 1);
    }
    expect(result.size).toBe(10);
    for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      expect(result.get(i)).toBeGreaterThan(20);
    }
  });
});

describe("Cache.invalidate", () => {
  let cache: Cache<number>;

  beforeEach(() => {
    cache = new Cache<number>();
  });

  it("should invalidate the cache.", async () => {
    expect(await cache.get(() => Promise.resolve(1))).toBe(1);
    expect(await cache.get(() => Promise.resolve(2))).toBe(1);
    cache.invalidate();
    expect(await cache.get(() => Promise.resolve(3))).toBe(3);
  });
});
