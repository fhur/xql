# Query middlewares

Query middlewares are functions that are executed before a query is executed. They can be used to add additional functionality to the query, such as logging, caching, or authentication.

In the context of security, query middlewares can be used to add additional checks on every query, or limit the result set.

## Adding a middleware

You can add a middleware to the query engine as follows:

```ts
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
```

## When are middlewares executed?

When a query is executed, the ID check is performed first, and then the parameters are substituted. Then the middleware is executed.

This ensures that the middleware can inject additional parameters to the query as it's now happening in a safe context.
