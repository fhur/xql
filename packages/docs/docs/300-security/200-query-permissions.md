# Query permissions

SynthQL uses a declarative approach to define the permissions required to run a query.

With SynthQL, you don't need to sprinkle your code with permission assertions or `if()` conditions to check for permissions. Instead, you define, on a per-query basis, which permissions are required to run the query, and the `QueryEngine` takes care of the rest.

This approach offers both simplicity and robust security control.

## Defining permissions

The `.permissions()` method is used to define which permissions are required to run a query.

```ts
from('users').permissions('users:read').all();
```

The `.permissions(...listOfPermissions: string[])` method takes a list of permissions, where each permission is a string.

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

## Permission inheritance

When you include a subquery, the permissions accumulate. Users must have all permissions from both parent and subquery to execute the combined query.

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
