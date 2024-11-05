---
---

# Introduction

Letting clients make arbitrary queries, even if read-only comes with a set of security challenges. SynthQL comes with built in mechanisms to implement robust authorization logic so you can limit what queries clients can make.

Let's take a look at the different ways SynthQL ensures only the right queries will be sent to your database.

## Whitelisting queries

By default, the `QueryEngine` will not execute any query. It will only execute known queries. To register a query simply call the `registerQueries` method as follows.

```ts
import { from } from './db';

const users = from('users').columns('id', 'name', 'email');

const queryEngine = new QueryEngine(opts);

queryEngine.registerQueries(users);
```

What this means is that the `QueryEngine` will only allow queries on the `users` table and will allow any subset of the `id`, `name` and `email` columns to be selected.

This behaviour can be disabled with the `allowUnknownQueries` option.

```ts
const queryEngine = new QueryEngine({..., allowUnknownQueries:true});
```

You can read more about registered queries [here](/docs/security/query-whitelisting).

## Restricting access to tables and columns

You can use the `.requires` method to define what permissions are required to run the query.

```ts
const users = from('users')
    .columns('id', 'name', 'email')
    .requires('users:read');

const pets = from('pets')
    .columns('id', 'owner_id')
    .requires('pets:read')
    .include({
        owner: users.where({ owner_id: col('users.id') }).maybe(),
    });

const userFull = from('users')
    .columns('id', 'name', 'email', 'hashed_password')
    .requires('users:read', 'users:admin');
```

When executing queries, you can pass a list of the user's current permissions:

```ts
const user = { permissions: ['users:read', 'pets:read'] };
queryEngine.execute(query, { user });
```

The query engine will traverse the query recursively and reject the query unless it meets all the ACL requirements.

## Restricting access to rows

Let's imagine an `orders` table that stores all orders made by `users`. A user should only ever be allowed to read it's own orders. This can be achieved with SynthQL, as follows:

First, we define the schema.

```tsx
// queries.ts
import { from } from './db';

const orders = from('orders').columns(
    'id',
    'total_amount',
    'product_ids',
    'user_id',
);
```

Now, let's imagine a client makes the following query. Note that this query will select all orders.

```tsx
import { useSynthql } from '@synthql/react';
import { orders } from './queries';

const query = orders.where(isNotNull('id')).many();

useSynthql(query);
```

To prevent these kinds of mistakes or abuses, you can add middlewares to the `QueryEngine`. A middleware is essentially a function that takes the query context and the current query and return a new query context and a new query.

In this example, we're creating a middleware that will act on every query to the `orders` table and will for a filter on the `user_id` column.

```tsx
import { DB } from './db';
import { QueryEngine, mapQuery } from '@synthql/backend';
import { orders } from './queries';

const restrictOrdersByUser = middleware<DB>()
    .from('orders')
    .mapQuery((query, context) => {
        const userId = context.user.id;
        return {
            context,
            query: {
                ...query,
                // transforms the `where` to ensure that only orders can be read from the
                // current user.
                where: {
                    ...query.where,
                    user_id: userId,
                },
            },
        };
    });

const queryEngine = new QueryEngine<DB>({
    middlewares: [restrictOrdersByUser],
});

queryEngine.registerQueries(orders);
```
