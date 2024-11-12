# Query middlewares

Query middlewares are functions that are run before a query is executed. They can be used to add additional functionality to the query, such as logging, caching, or authentication.

In the context of security, query middlewares can be used to add additional checks to every query or limit the result set.

## Adding a middleware

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
    url: 'postgresql://user:password@localhost:5432/dbname',
    middlewares: [restrictPaymentsByCustomer],
});
```

## When are middlewares executed?

When a query is executed, a hash check is performed first (if query whitelisting is enabled), followed by the substitution of any parameterized fields. After that, the middleware is executed.

This ensures that the middleware can inject additional parameters into the query, as it is now happening in a safe context.
