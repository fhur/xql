# Query whitelisting

One of the core security goals of SynthQL is to be secure out of the box. This means that, by default, the `QueryEngine` will not execute unknown queries. Queries must be explicitly registered (i.e., `whitelisted`) with the `QueryEngine` in order to be executed.

```ts
const findAllActiveUsers = () =>
    from('users').columns('id', 'name', 'email').filter({ active: true }).all();

const queryEngine = new QueryEngine({
    url: 'postgresql://user:password@localhost:5432/dbname',
});

// Register the query (add it to the whitelist)
queryEngine.registerQueries([findAllActiveUsers()]);

// The `QueryEngine` will now only execute the registered queries
const result = await queryEngine.executeAndWait(findAllActiveUsers());
```

## Why registered queries?

Registered queries are a security feature that ensures only known queries are executed. This prevents potentially malicious actors from executing arbitrary queries on your database.

When you build a traditional REST API, you implicitly "register queries" by defining the available endpoints. Since SynthQL is more dynamic, we need an explicit mechanism to indicate that a query was authored in a safe context.

## How to register queries

Registering queries is simple. All you need to do is pass the query to the `registerQueries()` method.

Since some queries take parameters, you will need to pass a placeholder value when registering the query.

```ts
import { param } from '@synthql/queries';
import { from } from '../generated';

const findUserById = (id: number) =>
    from('users').columns('id', 'name', 'email').filter({ id }).first();

const queryEngine = new QueryEngine({
    url: 'postgresql://user:password@localhost:5432/dbname',
});

// Notice that we are passing a placeholder value of `0` for the
// `id` parameter. We could have passed any value, it is essentially
// telling the QueryEngine that the `id` is a parameter for the
// query, and can be replaced with any value.
queryEngine.registerQuery(findUserById(0));

// You can now invoke the query with any value
const result = await queryEngine.executeAndWait(findUserById(anyUserId));
```

## Queries with conditional logic

Some queries may include conditional logic. For example, you might want to alter the structure of the query based on the value of a parameter.

```ts
const findUsersByStatus = (status: 'active' | 'inactive') => {
    const query = from('users')
        .columns('id', 'name', 'email')
        .filter({ status });

    if (status === 'active') {
        // If the user is active, we want to return all users
        return query.all();
    } else {
        // If the user is not active, we want to return only
        // the first 100 users as there might be too many.
        return query.take(100);
    }
};
```

The problem with these types of queries is that they return two different query instances depending on the value of the `status` parameter.

To register these queries correctly, you will need to register each variant individually.

```ts
const queryEngine = new QueryEngine({
    url: 'postgresql://user:password@localhost:5432/dbname',
});

queryEngine.registerQueries([
    findUsersByStatus('active'),
    findUsersByStatus('inactive'),
]);
```

## The security of registered queries

:::note
This is an advanced topic. You don't need to understand this section to use SynthQL.
:::

:::info
While the `QueryEngine` provides a `dangerouslyAllowUnregisteredQueries` option, using it bypasses the security benefits of query whitelisting and is strongly discouraged in production environments.
:::

Since much of the security of SynthQL depends on registered queries, it’s important to understand how they work.

The high-level idea is simple:

1.  **Identifying queries**: When a query is registered, we calculate a hash of the query. This hash is then used to identify the query.

2.  **Checking queries**: When a query is executed, the `QueryEngine` checks the hash of the query to ensure that it has been registered.

3.  **Parameter substitution**: When a query hash matches, the parameter values are substituted, and the query is executed.

### Identifying queries

Every query is given a hash upon creation. The `hash` is used to identify the query in the `QueryEngine`.

When a query is registered, the `QueryEngine` calculates the `hash` and stores it in memory.

### Checking queries

Whenever a query is executed, the `QueryEngine` calculates the hash of the query and checks if it has been registered. If it has, the query is executed. If it has not, the query is rejected.

### Parameter substitution

When a query is executed, the `QueryEngine` substitutes the parameter values into the query and executes it.

For example:

```ts
const findUserById = (id: number) => from('users').filter({ id }).first();

// The `QueryEngine` will substitute the parameter values into the query and execute it.
queryEngine.registerQuery(findUserById(0));
```

### What happens in case of a hash collision?

If you try to register two different queries with the same hash, the `QueryEngine` will throw an error.

If a malicious user tries to execute query A with the hash of query B, it will be equivalent to simply executing query B.

### How is the hash calculated?

The hash is calculated by `JSON.stringify()`ing the query and then hashing the result. We hash the stringified query to avoid sending potentially large JSON strings over the wire. Special care is taken to ensure that the parts of the query that are parameterizable are not hardcoded in the hash.

For example, the following two queries will have the same hash:

```ts
const queryA = from('users').filter({ active: true }).all();
const queryB = from('users').filter({ active: false }).all();
```

But these two will not:

```ts
const queryC = from('users')
    .columns('id', 'name', 'email')
    .filter({ active: true })
    .all();
const queryD = from('users').columns('email').filter({ active: true }).all();
```

The query hash is calculated by the [`hashQuery`](https://github.com/synthql/SynthQL/blob/master/packages/queries/src/util/hashQuery.ts#L9) function.
