# Query permissions

SynthQL uses a declarative approach to define the permissions required to run a query.

With SynthQL, you don't need to sprinkle your code with permission assertions or `if` conditions to check for permissions. Instead, you define, on a per-query basis, which permissions are required to run the query, and the `QueryEngine` takes care of the rest.

This approach is both simple and very powerful.

## Defining permissions

The `.permissions()` method is used to define which permissions are required to run a query.

```ts
from('users').permissions('users:read').all();
```

The `.permissions(...roles: string[])` method takes a list of roles, where each role is a string.

```ts
from('users').permissions('users:read', 'users:write').all();
```

You can use a TypeScript enum to define the list of permissions and gain extra type safety.

```ts
enum Permissions {
    usersRead = 'users:read',
    usersWrite = 'users:write',
}

const query = from('users')
    .permissions(Permissions.usersRead, Permissions.usersWrite)
    .all();
```

## Role inheritance

When you include a sub-query, the permissions accumulate. This means the user needs to have all the permissions of both the parent and sub-query in order to execute the query.

```ts
const pets = from('pets')
    .permissions('pets:read')
    .filter({ owner_id: col('users.id') })
    .all();

const query = from('users').permissions('users:read').include({ pets }).all();
```

In this example, the user needs to have both the `users:read` and `pets:read` permissions to execute the query.

## Query context

When you execute a query, you can pass a `context` object. This object is used to provide additional information to the query, such as the user's permissions.

```ts
// You want to generate this from some source, e.g. parsing the cookie sent with a HTTP request
const context = { permissions: ['users:read', 'pets:read'] };

// Execute the query
const result = await queryEngine.executeAndWait(query, { context });
```

## The security of query permissions

:::info
While the `QueryEngine` provides a `dangerouslyIgnorePermissions` option, using it bypasses the security benefits of query permissioning and is strongly discouraged in production environments.
:::

The `QueryEngine` will traverse the query recursively and reject it unless it meets all the ACL requirements. However, if you don't want these permissions (ACL requirements) to be checked, you can set the `dangerouslyIgnorePermissions` option when initializing the `QueryEngine`.

## What of query whitelisting (i.e. `QueryEngine.registerQueries()`)?

When a query is added to the whitelist using `registerQueries()`, it is registered along with its permissions. This ensures that a malicious client cannot modify the ACL requirements of the query.
