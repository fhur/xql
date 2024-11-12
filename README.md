<div align="center">

<img src="/assets/logo.png" width="88" alt="SynthQL"  />
<h1 style="margin-top:16px">SynthQL</h1>
<p>A full-stack, type-safe client to your PostgreSQL database with a focus on DX and performance.</p>
</div>

## Show me some code

```ts
import { QueryEngine } from '@synthql/backend';
import { from } from './generated';

export const queryEngine = new QueryEngine({
    url: 'postgresql://user:password@localhost:5432/dbname',
});

const query = from('films')
    .columns('id', 'title', 'year')
    .filter({ id: { in: [1, 2, 3] } })
    .all();

const data = await queryEngine.executeAndWait(query);

// `data` will resolve to:
[
    {
        id: 1,
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        year: '2001',
    },
    {
        id: 2,
        title: 'The Lord of the Rings: The Two Towers',
        year: '2002',
    },
    {
        id: 3,
        title: 'The Lord of the Rings: The Return of the King',
        year: '2003',
    },
];
```

## Links

-   [Website](https://synthql.dev)
-   [Docs](https://synthql.dev/docs/getting-started)
-   [API](https://synthql.dev/reference)
-   [X/Twitter](https://twitter.com/fernandohur)
-   [GitHub](https://github.com/synthql/SynthQL)
