# @synthql/react

React client for SynthQL based on [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/installation).

```ts
import { from } from './generated';

const query = from('users').columns('id', 'first_name').filter({ id: 1 }).all();

const { data: users } = useSynthql(query);

console.log(users);
// Will print:
[{ id: 1, first_name: 'John' }];
```

## Links

-   [Website](https://synthql.dev)
-   [Docs](https://synthql.dev/docs/getting-started)
-   [X/Twitter](https://twitter.com/fernandohur)
-   [GitHub](https://github.com/synthql/SynthQL)
