# @synthql/queries

DSL for writing SynthQL queries.

```ts
import { from } from './generated';

const findUserById = (id: number) =>
    from('users').columns('id', 'first_name').filter({ id }).all();
```

## Links

-   [Website](https://synthql.dev)
-   [Docs](https://synthql.dev/docs/getting-started)
-   [X/Twitter](https://twitter.com/fernandohur)
-   [GitHub](https://github.com/synthql/SynthQL)
