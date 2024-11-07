# Introduction

Allowing clients to make arbitrary queries, even if read-only, comes with a set of security challenges. SynthQL provides built-in mechanisms to implement robust authorization logic, allowing you to limit what queries clients can execute.

Let’s take a look at the different ways SynthQL ensures that only the right queries are sent to your database.

## Whitelisting queries

By default, the `QueryEngine` will not execute any queries. It will only execute known queries. To register a query, simply call the `registerQueries()` method as follows:

```ts
import { from } from './generated';
import { QueryEngine } from '@synthql/backend';

const users = from('users').columns('id', 'name', 'email').all();

// Ensure DATABASE_URL is set in your .env file:
// DATABASE_URL=postgresql://user:password@localhost:5432/dbname
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required!');
}

// Initialize query engine
const queryEngine = new QueryEngine({
    url: process.env.DATABASE_URL,
});

// Register query
queryEngine.registerQueries([users]);
```

What this means is that the `QueryEngine` will only allow queries on the `users` table and will permit any subset of the `id`, `name`, and `email` columns to be selected.

This feature can be disabled with the `dangerouslyAllowUnregisteredQueries` option.

```ts
const queryEngine = new QueryEngine({
    url: process.env.DATABASE_URL,
    dangerouslyAllowUnregisteredQueries: true,
});
```

You can read more about registered queries [here](/docs/security/query-whitelisting).

## Restricting access to tables and columns

You can use the `.permissions()` method to define the permissions required to run the query.

```ts
const users = from('users')
    .columns('id', 'name', 'email')
    .permissions('users:read');

const pets = from('pets')
    .columns('id', 'owner_id')
    .permissions('pets:read')
    .include({
        owner: users.where({ owner_id: col('users.id') }).first(),
    })
    .all();
```

When executing queries, you can pass a list of the user's current permissions as part of the query execution `context` object:

```ts
// You want to generate this from some source, e.g. parsing the cookie sent with a HTTP request
const context = {
    id: 1,
    email: 'user@example.com',
    isActive: true,
    roles: ['user'],
    permissions: ['users:read', 'pets:read'],
};

// Execute the query
const result = await queryEngine.executeAndWait(pets, { context });
```

The query engine will traverse the query recursively and reject it unless it meets all the ACL requirements.

## Restricting access to rows

Let’s imagine an `payment` table that stores all orders made by customers (users) in the `customer` table. A user should only be allowed to read their own orders. This can be achieved with SynthQL, as follows:

First, we define the schema:

```ts
// queries.ts
const payments = from('payments')
    .columns('id', 'total_amount', 'product_ids', 'customer_id')
    .permissions('payments:read')
    .many();
```

Now, let's examine the following query. Note that this query will select all orders.

```ts
import { payments } from './queries';

// You want to generate this from some source, e.g. parsing the cookie sent with a HTTP request
const context = {
    id: 1,
    email: 'user@example.com',
    isActive: true,
    roles: ['user'],
    permissions: ['payments:read'],
};

// Execute the query
const result = await queryEngine.executeAndWait(payments, { context });
```

To prevent these kinds of mistakes or abuses, you can add middlewares to the `QueryEngine`. A middleware is essentially a function that takes the query context and the current query, uses the context to transform the query, and then returns the newly transformed query.

In this example, we're creating a middleware that will act on every query to the `payment` table and add a filter to the `customer_id` column.

```ts
// index.ts
import { DB } from './generated';
import { QueryEngine, middleware } from '@synthql/backend';
import { Query } from '@synthql/queries';
import { payments } from './queries';

// Create types & interface for context
type UserRole = 'user' | 'admin' | 'super';

type UserPermission = 'user:read' | 'admin:read' | 'super:read';

interface Session {
    id: number;
    email: string;
    isActive: boolean;
    roles: UserRole[];
    permissions: UserPermission[];
}

// Create middleware
const restrictPaymentsByCustomer = middleware<Query<DB, 'payments'>, Session>({
    predicate: ({ query, context }) =>
        query?.from === 'payments' &&
        context?.roles?.includes('user') &&
        context?.isActive,
    transformQuery: ({ query, context }) => ({
        ...query,
        where: {
            ...query.where,
            customer_id: context.id,
        },
    }),
});

// Initialize query engine and register middleware
const queryEngine = new QueryEngine<DB>({
    url: process.env.DATABASE_URL,
    middlewares: [restrictPaymentsByCustomer],
});

// Register query
queryEngine.registerQueries([payments]);
```
