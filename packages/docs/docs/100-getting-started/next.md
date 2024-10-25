import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Getting started: Next.js Route Handlers

:::tip
Before reading this, first check out:
[Quick start: Node.js](./quick-start) if you haven't yet
:::

## Install the packages

Start by installing the SynthQL packages:

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

### Next.js handler package

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

## Next.js Route Handler usage

To set up a [Next.js](https://nextjs.org/docs/14/getting-started/installation) Route Handler to execute SynthQL queries sent over HTTP, you can use the handler function, as shown below:

### Step 1: Set up the query engine

The `QueryEngine` compiles SynthQL queries into plain SQL and sends them to the database.

```ts
// src/queryEngine.ts
import { QueryEngine } from '@synthql/backend';

export const queryEngine = new QueryEngine({
    url: process.env.DATABASE_URL,
});
```

### Step 2: Set up a route handler to execute SynthQL queries

```ts
// src/app/[...synthql]/route.ts
import { createNextSynthqlHandler } from '@synthql/handler-next';
import { queryEngine } from '../../../queryEngine';

const nextSynthqlRequestHandler = createNextSynthqlHandler(queryEngine);

export async function POST(request: Request) {
    return await nextSynthqlRequestHandler(request);
}
```
