import InstallPackage from '../../src/components/HomepageFeatures/InstallPackage';

# Next.js Route Handlers

:::tip
Before reading this, first check out:
[Quick start: Node.js](./quick-start) if you haven't already
:::

:::info
After reading this, you'll probably want to set up your frontend app to send queries to your new SynthQL server. To get started, check out:
[Getting started: React](./react) if you haven't already
:::

## Install the packages

Start by installing the SynthQL packages:

### Query engine package

<InstallPackage packageName="@synthql/backend" />

### Next.js handler package

<InstallPackage packageName="@synthql/handler-next" />

## Next.js Route Handler usage

To set up a [Next.js](https://nextjs.org/docs/14/getting-started/installation) Route Handler to execute SynthQL queries sent over HTTP, you can use the handler function, as shown below:

### Step 1: Set up the query engine

The `QueryEngine` compiles SynthQL queries into plain SQL and sends them to the database.

```ts
// src/queryEngine.ts
import { QueryEngine } from '@synthql/backend';

export const queryEngine = new QueryEngine({
    url: 'postgresql://user:password@localhost:5432/dbname',
});
```

### Step 2: Set up a route handler to execute SynthQL queries

```ts
// src/app/[...synthql]/route.ts
import { createNextSynthqlHandler } from '@synthql/handler-next';
import { queryEngine } from '../../../queryEngine';

const nextSynthqlRequestHandler = createNextSynthqlHandler(queryEngine);

// Create route handler
export async function POST(request: Request) {
    return nextSynthqlRequestHandler(request);
}
```
