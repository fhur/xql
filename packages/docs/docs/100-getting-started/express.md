import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Getting started: Express.js

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

### Express.js handler package

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

## Express.js usage

To set up an [Express.js](https://expressjs.com/en/starter/installing.html) server to execute SynthQL queries sent over HTTP, you can use the handler function, as shown below:

### Step 1: Set up the query engine

The `QueryEngine` compiles SynthQL queries into plain SQL and sends them to the database.

```ts
// src/queryEngine.ts
import { QueryEngine } from '@synthql/backend';

export const queryEngine = new QueryEngine({
    url: process.env.DATABASE_URL,
});
```

### Step 2: Set up a route to execute SynthQL queries

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
