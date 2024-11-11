# Introduction

SynthQL comes with a simple, but powerful query language. Let's see a few examples:

## Find user by ID

```ts
import { from } from './generated';

const users = from('users').columns('id', 'name');

export function findUserById(id: string) {
    return users.filter({ id }).first();
}
```

## Find users by IDs

```ts
import { from } from './generated';

const users = from('users').columns('id', 'name');

export function findUserById(ids: string[]) {
    return users.filter({ id: { in: ids } }).first();
}
```

## Find users with pets (1 to n relation)

```ts
import { from } from './generated';

const pets = from('pets').columns('id', 'name', 'owner_id');

const users = from('users').columns('id', 'name');

export function findUserByIds(ids: string[]) {
    const pets = pets
        .filter({
            owner_id: col('users.id'),
        })
        .all();
    return users
        .include({
            pets,
        })
        .filter({ id: { in: ids } })
        .first();
}
```

This query will return the following shape:

```ts
Array<{
    id: string;
    name: string;
    pets: Array<{ id: string; name: string }>;
}>;
```
