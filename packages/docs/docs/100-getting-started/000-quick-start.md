import InstallPackage from '../../src/components/HomepageFeatures/InstallPackage';

# Quick start: Node.js

## Install the packages

Start by installing the SynthQL packages:

### Query builder package

<InstallPackage packageName="@synthql/queries" />

### Query engine package

<InstallPackage packageName="@synthql/backend" />

## Generate database types

Then generate the types and schema definitions from your database, using the `@synthql/cli`:

```bash
npx @synthql/cli generate \
    # The database connection string
    --url=postgresql://user:password@localhost:5432/dbname \
    # The folder where SynthQL will write the generated types
    --out=./src/generated
```

In the example above, this will generate a types file at `src/generated/db.ts`, a schema definitions file at `src/generated/schema.ts` and an index file that connects both to the query builder and exports them, at `src/generated/index.ts`.

This connection allows you to export a type-safe query builder, `from()`, which has all the table and column names with the corresponding TypeScript types, as sourced from your database.

## Write your first query

With the `from()` query builder you've generated, you can now create a SynthQL query with autocompletion & type-safety for all tables and columns.

```ts
// src/queries.ts
import { from } from 'src/generated';

const findUserByIds = (ids: number[]) => {
    return (
        from('users')
            // Select which columns you want
            // NOTE: if you want to select all columns, simply don't use
            // this method in your builder, and SynthQL will select them internally
            .columns('id', 'email')
            // Specify filter: Filter by IDs
            .filter({ id: { in: ids } })
            // Return the first 100 records that match
            .take(100)
    );
};
```

## Set up the query engine

The `QueryEngine` compiles SynthQL queries into plain SQL and sends them to the database.

```ts
// src/queryEngine.ts
import { QueryEngine } from '@synthql/backend';

// Ensure DATABASE_URL is set in your .env file:
// DATABASE_URL=postgresql://user:password@localhost:5432/dbname
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required!');
}

export const queryEngine = new QueryEngine({
    url: process.env.DATABASE_URL,
});
```

## Execute the query

The easiest way to execute a SynthQL query. Simply pass your query to the `executeAndWait()` method exported by your created `QueryEngine` instance.

```ts
// src/index.ts
// Execute the `findUserByIds` query
const query = findUserByIds([1, 2]);

const result = await queryEngine.executeAndWait(query);

console.log(result);
// Will print:
[
    { id: 1, email: 'alice@example.com' },
    { id: 2, email: 'bob@example.com' },
];
```
