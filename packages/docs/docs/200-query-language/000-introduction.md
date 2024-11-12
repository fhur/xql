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

## Find user by IDs

```ts
import { from } from './generated';

const users = from('users').columns('id', 'name');

export function findUserByIds(ids: string[]) {
    return users.filter({ id: { in: ids } }).first();
}
```

## Find user with pets (1 to n relation)

```ts
import { from } from './generated';

const pets = from('pets').columns('id', 'name', 'owner_id');

const users = from('users').columns('id', 'name', 'address');

export function findUserAndPetsByIds(ids: string[]) {
    const userPets = pets
        .filter({
            owner_id: col('users.id'),
        })
        .all();

    return users
        .include({
            userPets,
        })
        .filter({ id: { in: ids } })
        .first();
}
```

This query will return the following shape:

```ts
type UserAndPets = {
    id: string;
    name: string;
    address: string;
    userPets: Array<{ id: string; name: string; owner_id: string }>;
};
```
