# Query whitelisting

One of the core security goals of SynthQL is to be secure out-of-the-box. This means that, by default, the `QueryEngine` will not execute unknown queries. Queries need to be explicitly registered (i.e., `whitelisted`) with the `QueryEngine` in order to be executed.

```ts
const findAllActiveUsers = () => from('users')
    .columns('id','name','email')
    .filter({active: true})
    .all()

const queryEngine = new QueryEngine({...})

// Register the query
queryEngine.registerQuery(findAllActiveUsers())

// The QueryEngine will now only execute the registered queries
queryEngine.execute(findAllActiveUsers(), { context })
```

## Why registered queries?

Registered queries are a security feature that ensures that only known queries are executed. This prevents a potentially malicious actor from executing arbitrary queries on your database.

When you build a traditional REST API, you implicitly "register queries" by defining the endpoints that are available. As SynthQL is more dynamic, we need an explicit mechanism to indicate that a query was authored in a safe context.

## How to register queries

Registering queries is simple. All you need to do is pass the query to the `QueryBuilder#registerQueries` or `QueryEngine#registerQuery` methods.

As some queries take parameters, you will need to pass a placeholder value when you register the query.

```ts
import { param } from '@synthql/queries'
import { from } from "../generated";

const findUserById = (id: number) => from('users')
    .columns('id','name','email')
    .filter({id})
    .first()

const queryEngine = new QueryEngine({...})

// Notice that we are passing a placeholder value of `0` for the
// `id` parameter. We could have passed any value, it is essentially
// telling the QueryEngine that the `id` is a parameter for the
// query, and can be replaced with any value.
queryEngine.registerQuery(findUserById(0))

// You can now invoke the query with any value
queryEngine.execute(findUserById(anyUserId))
```

## Queries with conditional logic

Some queries may have conditional logic. For example, you may want to alter the structure of the query based on the value of a parameter.

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

The problem with these types of queries is that they actually return two different query instances depending on the value of the `status` parameter.

To register these types of queries correctly, you will need to register each variant of the query individually.

```ts
const queryEngine = new QueryEngine({...})

queryEngine.registerQueries([
    findUsersByStatus('active'),
    findUsersByStatus('inactive')
])
```

## The security of registered queries

> Note: this is an advanced topic. You don't need to understand this section to use SynthQL.

As a lot of the security of SynthQL depends on the registered queries, it is important to understand how they work.

The high level idea is simple:

1.  Identifying queries: When a query is registered, we calculate a hash of the query. This hash is then used to identify the query.

2.  Checking queries: When a query is executed, the QueryEngine will check the hash of the query to ensure that it has been registered.

3.  Parameter substitution: When a query hash matches, the parameter values are substituted and the query is executed.

### Identifying queries

Every query is given a hash upon creation. The combination of `hash` and `name` is used to identify the query in the QueryEngine.

When a query is registered, the QueryEngine calculates an ID based on the `hash` and `name` and stores it in memory.

### Checking queries

Whenever a query is executed, the QueryEngine will calculate the ID of the query and check if it has been registered. If it has, the query is executed. If it has not, the query is rejected.

### Parameter substitution

When a query is executed, the QueryEngine will substitute the parameter values into the query and execute it.

Example:

```ts
const findUserById = (id: number) => from('users').filter({ id }).first();

// The QueryEngine will substitute the parameter values into the query and execute it.
queryEngine.registerQuery(findUserById(0));
```

### What happens in case of a hash collision?

If you try to register two different queries with the same hash, the QueryEngine will throw an error.

If a malicious user tries to execute a query A with the hash of query B, it would be equivalent to simply trying to execute query B.

### How is the hash calculated?

The hash is calculated by `JSON.stringify`ing the query, and then hashing the result. We hash the stringified query to avoid sending possibly very large JSON strings over the wire. Special care is taken to ensure that the parts of the query that are parameterizable are not hardcoded in the hash.

So for example, the following two queries will have the same hash:

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

The Query hash is calculated by the [`hashQuery`](https://github.com/synthql/SynthQL/blob/master/packages/queries/src/util/hashQuery.ts#L9) function.
