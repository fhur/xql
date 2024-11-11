# @synthql/handler-next

SynthQL-compatible route handler function for use in [Next.js](https://nextjs.org/docs/14/getting-started/installation) App Router.

```ts
// src/queryEngine.ts
import { QueryEngine } from '@synthql/backend';

export const queryEngine = new QueryEngine({
    url: 'postgresql://user:password@localhost:5432/dbname',
});

// src/app/[...synthql]/route.ts
import { createNextSynthqlHandler } from '@synthql/handler-next';
import { queryEngine } from '../../../queryEngine';

const nextSynthqlRequestHandler = createNextSynthqlHandler(queryEngine);

export async function POST(request: Request) {
    return nextSynthqlRequestHandler(request);
}
```

## Links

-   [Website](https://synthql.dev)
-   [Docs](https://synthql.dev/docs/getting-started)
-   [X/Twitter](https://twitter.com/fernandohur)
-   [GitHub](https://github.com/synthql/SynthQL)
