# @synthql/react

React client for SynthQL based on `tanstack/react-query`.

```ts
import { from } from './generated';

const query = from('users').columns('id', 'first_name').filter({ id: 1 }).all();

useSynthql(query);
```

## Links

-   [Website](https://synthql.dev)
-   [Docs](https://synthql.dev/docs/getting-started)
-   [X/Twitter](https://twitter.com/fernandohur)
-   [GitHub](https://github.com/synthql/SynthQL)
