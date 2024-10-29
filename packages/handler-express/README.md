# @synthql/handler-express

SynthQL-compatible route handler function for use in [Express.js](https://expressjs.com/en/starter/installing.html) server app.

```ts
// src/queryEngine.ts
import { QueryEngine } from '@synthql/backend';

export const queryEngine = new QueryEngine({
    url: process.env.DATABASE_URL,
});

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

## Links

-   [Website](https://synthql.dev)
-   [Docs](https://synthql.dev/docs/getting-started)
-   [X/Twitter](https://twitter.com/fernandohur)
-   [GitHub](https://github.com/synthql/SynthQL)
