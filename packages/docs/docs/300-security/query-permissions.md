# Query permissions

SynthQL uses a declarative approach to define what permissions are required to run a query. This approach is both simple and powerful, and makes it easy to understand what permissions are required to run a query.

With SynthQL you don't need to sprinkle your code with permission assertions or `if` conditions to check for permissions, instead you define on a per-query basis what permissions are required to run the query, and the QueryEngine will take care of the rest.

## Defining permissions

The `.requires()` method is used to define what permissions are required to run a query.

```ts
from('users').requires('users:read').all();
```

The `.requires(...roles:string[])` method takes a list of roles. Roles can be any string.

```ts
from('users').requires('users:read', 'users:write').all();
```

You can use an TypeScript enum to define the list of permissions and get extra type safety:

```ts
enum Permissions {
    usersRead = 'users:read',
    usersWrite = 'users:write',
}

from('users').requires(Roles.usersRead, Roles.usersWrite).all();
```

## Role inheritance

When you include a sub-query, the permissions add up. This means the user needs to have all the permissions of both the parent and sub-query to be able to execute.

```ts
const pets = from('pets')
    .requires('pets:read')
    .where({ owner_id: col('users.id') })
    .all();

from('users').requires('users:read').include({ pets }).all();
```

In this example, the user needs to have the `users:read` and `pets:read` permissions to execute the query.

## Query context

When you execute a query, you can pass a `context` object. This object is used to pass additional information to the query, such as the user's permissions.

```ts
// You want to generate this from some source, e.g. parsing the cookie sent with a HTTP request
const context = { permissions: ['users:read', 'pets:read'] };

// Execute the query
const result = await queryEngine.executeAndWait(query, { context });
```

The query engine will traverse the query recursively and reject the query unless it meets all the ACL requirements.

## Query registration

When a query is registered, it is registered along with its permissions. This means a malicious client cannot modify the ACL requirements of a query.
