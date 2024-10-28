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

// Ensure DATABASE_URL is set in your .env file:
// DATABASE_URL=postgresql://user:password@localhost:5432/dbname
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const queryEngine = new QueryEngine({
    url: process.env.DATABASE_URL,
});
```

### Step 2: Set up a route to execute SynthQL queries

```ts
// src/index.ts
import express from 'express';
import cors from 'cors';
import { createExpressSynthqlHandler } from '@synthql/handler-express';
import { queryEngine } from './queryEngine';

const app = express();

// Enable CORS for your client application
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));

const expressSynthqlRequestHandler = createExpressSynthqlHandler(queryEngine);

app.post('/synthql', async (req, res, next) => {
    try {
        return await expressSynthqlRequestHandler(req, res);
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

app.listen(3000);
```
