---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Getting started

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

### Server-side/full-stack handler function packages

#### Express.js

<Tabs>
<TabItem value="npm" label="npm">

```bash
npm install @synthql/handler-express
```

</TabItem>
  
<TabItem value="yarn" label="yarn">

```bash
yarn add @synthql/handler-express
```

</TabItem>

<TabItem value="pnpm" label="pnpm">

```bash
pnpm add @synthql/handler-express
```

</TabItem>
</Tabs>

#### Next.js

<Tabs>
<TabItem value="npm" label="npm">

```bash
npm install @synthql/handler-next
```

</TabItem>
  
<TabItem value="yarn" label="yarn">

```bash
yarn add @synthql/handler-next
```

</TabItem>

<TabItem value="pnpm" label="pnpm">

```bash
pnpm add @synthql/handler-next
```

</TabItem>
</Tabs>

### Client packages

#### React & React-based framework apps

<Tabs>
<TabItem value="npm" label="npm">

```bash
npm install @synthql/react
```

</TabItem>
  
<TabItem value="yarn" label="yarn">

```bash
yarn add @synthql/react
```

</TabItem>

<TabItem value="pnpm" label="pnpm">

```bash
pnpm add @synthql/react
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

This will generate a types file at `src/generated/db.ts`, a schema definitions file at `src/generated/schema.ts` and an index file that exports both at `src/generated/index.ts`.

## Write your first query

```ts
// src/queries.ts
import { Query } from '@synthql/queries';
import { DB, from } from 'src/generated';

const findUserByIds = (ids: string[]) => {
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
    url: process.env.DATABASE_URL,
});
```

## Execute the query

### Server-side query execution

The easiest way to execute a SynthQL query. Simply pass your query to the `executeAndWait()` method exported by your created `QueryEngine` instance.

```ts
// Execute the `findUserByIds` query
const query = findUserByIds();

const result = await queryEngine.executeAndWait(query);
```

To set up a server to execute SynthQL queries sent over HTTP, you can use either of the two handler functions, as shown below:

#### Express.js usage

```ts
// src/index.ts
import express from 'express';
import { createExpressSynthqlHandler } from '@synthql/handler-express';
import { queryEngine } from './queryEngine';

const app = express();
const expressSynthqlRequestHandler = createExpressSynthqlHandler(queryEngine);

app.post('/synthql', async (req, res) => {
    return await expressSynthqlRequestHandler(req, res);
});

app.listen(3000);
```

#### Next.js usage

```ts
// src/app/[...synthql]/route.ts
import { createNextSynthqlHandler } from '@synthql/handler-next';
import { queryEngine } from './queryEngine';

const nextSynthqlRequestHandler = createNextSynthqlHandler(queryEngine);

export async function POST(request: Request) {
    return await nextSynthqlRequestHandler(request);
}
```

### Client-side query execution

#### React usage

For client-side execution, you want to use the `SynthqlProvider` inside an instance of the `QueryClientProvider` exported by [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/installation), then wrap your app at the level you want the provider to be available, as shown below:

```tsx
// Create a provider
// src/providers/AppProvider.tsx
// prettier-ignore
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

// Use the provider to wrap your app
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

// Execute the `findUserByIds` query, somewhere inside your app
// src/app/page.tsx
// prettier-ignore
'use client'; // Use in React Server Components app to specify that it is a client component
import { useSynthql } from '@synthql/react';
import { DB } from '@/generated';
import { User } from '@/components/User';

const query = findUserByIds();

export default function Home() {
    const result = useSynthql<DB, 'users', typeof query>(query);

    return (
        <main>
            {result.data?.map((user) => (
                <User key={user.user_id} userInfo={user} />
            ))}
        </main>
    );
}
```
