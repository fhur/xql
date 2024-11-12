import InstallPackage from '../../src/components/HomepageFeatures/InstallPackage';

# Express.js

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

### Express.js handler package

<InstallPackage packageName="@synthql/handler-express" />

## Express.js usage

To set up an [Express.js](https://expressjs.com/en/starter/installing.html) server to execute SynthQL queries sent over HTTP, you can use the handler function, as shown below:

### Step 1: Set up the query engine

The `QueryEngine` compiles SynthQL queries into plain SQL and sends them to the database.

```ts
// src/queryEngine.ts
import { QueryEngine } from '@synthql/backend';

export const queryEngine = new QueryEngine({
    url: 'postgresql://user:password@localhost:5432/dbname',
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

// Create route handler
app.post('/synthql', async (req, res) => {
    return expressSynthqlRequestHandler(req, res);
});

app.listen(3000);
```
