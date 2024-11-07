# @synthql/backend

The SynthQL backend.

```ts
import { QueryEngine } from '@synthql/backend';

// Initialize the query engine
const queryEngine = new QueryEngine({
    url: 'postgresql://user:password@localhost:5432/dbname',
});

// Write your query
const query = from('users')
    .columns('id', 'first_name')
    .where({ id: { in: [1, 2, 3] } })
    .many();

// Execute the query
const result = await queryEngine.executeAndWait(query);
```

## Links

-   [Website](https://synthql.dev)
-   [Docs](https://synthql.dev/docs/getting-started)
-   [X/Twitter](https://twitter.com/fernandohur)
-   [GitHub](https://github.com/synthql/SynthQL)
