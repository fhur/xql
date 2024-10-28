import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quick start: Node.js

## Install the packages

Start by installing the SynthQL packages:

### Query builder package

<Tabs>
<TabItem value="npm" label="npm">

```bash
npm install @synthql/queries
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn add @synthql/queries
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm add @synthql/queries
```

</TabItem>
</Tabs>

### Query engine package

<Tabs>
<TabItem value="npm" label="npm">

```bash
npm install @synthql/backend
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn add @synthql/backend
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm add @synthql/backend
```

</TabItem>
</Tabs>

## Generate database types

Then generate the types and schema definitions from your database, using the `@synthql/cli`:

```bash
npx @synthql/cli generate \
    # The database connection string
    --url=postgres://postgres:postgres@localhost:5432/postgres \
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

export const queryEngine = new QueryEngine({
    url: process.env.DATABASE_URL ?? (() => {
        throw new Error('DATABASE_URL environment variable is required');
    })(),
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
