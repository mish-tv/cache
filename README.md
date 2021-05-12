# @mish/cache
`@mish/cache` is a simple cache library that holds a single value in a single instance.

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
    const entity: Entity = // get entity;

    return entity;
  });

(async () => {
  const entity = await getEntity();
})();
```

## Other usage
```typescript
// You can configure ttl and jitter.
const entityCache = new Cache(60000, 1000);
```
