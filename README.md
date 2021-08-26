<h1 align="center">@mish-tv/cache</h1>

<div align="center">
<a href="https://www.npmjs.com/package/@mish-tv/cache"><img src="https://img.shields.io/npm/v/@mish-tv/cache.svg" alt="npm"></a>
<a href="https://github.com/mish-tv/cache/actions/workflows/build-and-test.yml"><img src="https://github.com/mish-tv/cache/actions/workflows/build-and-test.yml/badge.svg" alt="Build and test"></a>
<a href="https://codecov.io/gh/mish-tv/cache"><img src="https://img.shields.io/codecov/c/github/mish-tv/cache.svg" alt="coverage"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/github/license/mish-tv/cache.svg?style=flat" alt="license"></a>
</div>

<h4 align="center">`@mish-tv/cache` is a simple cache library that holds a single value in a single instance.</h4>


## Installation
```
npm install --save @mish-tv/cache
```

## Simple Usage
```typescript
import { Cache } from "@mish-tv/cache";

// By default, it caches for 1hour + rand()*6min.
const entityCache = new Cache<Entity>();

// Only at the beginning and when it expires,
// it calls an anonymous function passed as an argument and
// caches the returned value.
const getEntity = () =>
  entityCache.get(async () => {
    const entity: Entity = await fetch();

    return entity;
  });

(async () => {
  const entity = await getEntity();
})();
```

## Other Usage
```typescript
// You can configure ttl, jitter and initial value.
const entityCache = new Cache(60000, 1000, entity);

// You can create a cache that will never expire.
const entityCache = new Cache("infinity");
```
