# Custom query providers

While SynthQL is designed for database queries, it can also work with other data sources. Custom query providers allow you to use specific functions to fetch data from non-database sources as part of your query.

This can be used to fetch data from a REST endpoint, a file, or any other data source you can imagine.

## How can I configure a custom provider?

When constructing a `QueryEngine`, you can pass a list of `providers`. In this example, we're configuring a custom provider for the `rotten_tomatoes_rating` table.

```ts
import { QueryProvider } from "@synthql/backend";

interface DB {
    film: {
        columns: {
            id: {
                type: number;
                selectable: true;
                includable: true;
                whereable: true;
                nullable: false;
                isPrimaryKey: true;
            };
            title: {
                type: string;
                selectable: true;
                includable: true;
                whereable: true;
                nullable: false;
                isPrimaryKey: false;
            };
            last_update: {
                type: string;
                selectable: true;
                includable: true;
                whereable: true;
                nullable: false;
                isPrimaryKey: false;
            };
        };
    },
    rotten_tomatoes_rating: {
        columns: {
            title: {
                type: string;
                selectable: true;
                includable: true;
                whereable: true;
                nullable: false;
                isPrimaryKey: false;
            };
            rating: {
                type: number;
                selectable: true;
                includable: true;
                whereable: true;
                nullable: false;
                isPrimaryKey: true;
            };
            last_update: {
                type: string;
                selectable: true;
                includable: true;
                whereable: true;
                nullable: false;
                isPrimaryKey: false;
            };
        };
    }
}

const rottenTomatoesRatingProvider: QueryProvider<DB,'rotten_tomatoes_rating'> = {
    table: 'rotten_tomatoes_rating'.
    execute: ({title}) => {
        return fetchRottenTomatoesRatingByTitle(title) // custom data fetching logic should be inside here
    }
}

const queryEngine = new QueryEngine({
    providers: [rottenTomatoesRatingProvider]
});
```

This allows you build queries like:

```ts
export function findFilm(id: number) {
    const rating = from('rotten_tomatoes_rating')
        .columns('title', 'rating')
        .filter({ title: col('film.title') })
        .first();

    return from('film').columns('id', 'title').include({ rating }).all();
}
```

The `QueryEngine` will send the `film` query to the database, and the `rotten_tomatoes_rating` query to the query executor.
