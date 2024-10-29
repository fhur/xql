import InstallPackage from '../../src/components/HomepageFeatures/InstallPackage';

# React

:::info
This guide assumes that you have setup a server to receive and execute SynthQL queries. If you haven't yet, check out:
[Quick start: Node.js](./quick-start), [Getting started: Express.js](./express) and [Getting started: Next.js Route Handlers](./next)
:::

## Install the packages

Start by installing the SynthQL packages:

### Query builder package

<InstallPackage packageName="@synthql/queries" />

### React query client package

<InstallPackage packageName="@synthql/react" />

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

## React usage

For client-side query execution, you want to use the `SynthqlProvider` inside an instance of the `QueryClientProvider` exported by [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/installation), then wrap your app at the level you want the provider to be available, as shown below:

### Step 1: Create a provider

```tsx
// src/providers/AppProvider.tsx
'use client'; // Use in React Server Components app to specify that it is a client component
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SynthqlProvider } from '@synthql/react';

const queryClient = new QueryClient();

export function AppProvider(
    props: React.PropsWithChildren<{ endpoint: string }>,
) {
    return (
        <QueryClientProvider client={queryClient}>
            <SynthqlProvider
                value={{
                    endpoint: props.endpoint,
                    requestInit: {
                        method: 'POST',
                    },
                }}
            >
                {props.children}
            </SynthqlProvider>
        </QueryClientProvider>
    );
}
```

### Step 2: Use the provider to wrap your app

```tsx
// src/app/layout.tsx
import React from 'react';

export default function RootLayout({
    server,
    children,
}: Readonly<{
    server: { url: string };
    children: React.ReactNode;
}>) {
    return (
        <html>
            <body>
                {/* NOTE: this can be used any any level of your app */}
                <AppProvider endpoint={server.url}>{children}</AppProvider>
            </body>
        </html>
    );
}
```

### Step 3: Execute your query

```tsx
// src/app/page.tsx
'use client'; // Use in React Server Components app to specify that it is a client component
import { useSynthql } from '@synthql/react';
import { DB, from } from '@/generated';
import { User } from '@/components/User';

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

const query = findUserByIds([1, 2]);

export default function Home() {
    const result = useSynthql<DB, 'users', typeof query>(query);

    return (
        <main>
            {result.data?.map((user) => <User key={user.id} userInfo={user} />)}
        </main>
    );
}
```
