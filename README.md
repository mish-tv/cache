<h1 align="center">@mish/cache</h1>

<div align="center">
<a href="https://github.com/mish-tv/cache/actions/workflows/build-and-test.yml"><img src="https://github.com/mish-tv/cache/actions/workflows/build-and-test.yml/badge.svg" alt="GitHub Actions"></a>
</div>

<h4 align="center">`@mish/cache` is a simple cache library that holds a single value in a single instance.</h4>


## Installation
```
npm install --save @mish/cache
```

## Simple Usage
```typescript
import { Cache } from "@mish/cache";

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
// You can configure ttl and jitter.
const entityCache = new Cache(60000, 1000);
```
