import { describe, expect, test } from 'vitest';
import {
    DeferredResult,
    Query,
    QueryResult,
    QueryResultType,
    Table,
    col,
} from '.';
import { DB, from } from './generated';

describe('queries', () => {
    function fakeQueryResult<TQuery extends Query<DB, Table<DB>>>(
        q: TQuery,
    ): QueryResult<DB, TQuery> {
        return {} as any;
    }

    function fakeQueryResultType<TQuery extends Query<DB, Table<DB>>>(
        q: TQuery,
    ): QueryResultType<DB, TQuery> {
        return {} as any;
    }

    test('Find one actor with `name()`', () => {
        const q = from('actor')
            .columns('actor_id', 'first_name')
            .name('findActor')
            .one();

        const result = fakeQueryResult(q);

        result satisfies { actor_id: number; first_name: string };
    });

    test('Find one actor with `columns()`', () => {
        const q = from('actor').columns('actor_id', 'first_name').one();

        const result = fakeQueryResult(q);

        result satisfies { actor_id: number; first_name: string };
    });

    test('Find one actor with `select()`', () => {
        const q = from('actor')
            .select({
                actor_id: true,
                first_name: true,
            })
            .one();

        const result = fakeQueryResult(q);

        result satisfies { actor_id: number; first_name: string };
    });

    test('Find one actor with automatic select of all selectable columns', () => {
        const q = from('actor').one();

        const result = fakeQueryResult(q);

        result satisfies {
            actor_id: number;
            first_name: string;
            last_name: string;
            last_update: string;
        };
    });

    test('Find many actors', () => {
        const q = from('actor').columns('actor_id', 'first_name').many();

        type Actor = { actor_id: number; first_name: string };

        const result = fakeQueryResult(q);

        result satisfies Array<Actor>;

        const coreResult = fakeQueryResultType(q);

        coreResult satisfies Actor;
    });

    test('Find many actors with `offset()`', () => {
        const q = from('actor')
            .columns('actor_id', 'first_name')
            .offset(2)
            .many();

        type Actor = { actor_id: number; first_name: string };

        const result = fakeQueryResult(q);

        result satisfies Array<Actor>;

        const coreResult = fakeQueryResultType(q);

        coreResult satisfies Actor;
    });

    test('Find many actors with `take()`', () => {
        const q = from('actor').columns('actor_id', 'first_name').take(2);

        type Actor = { actor_id: number; first_name: string };

        const result = fakeQueryResult(q);

        result satisfies Array<Actor>;

        const coreResult = fakeQueryResultType(q);

        coreResult satisfies Actor;
    });

    test('Find maybe actor', () => {
        const q = from('actor').columns('actor_id', 'first_name').maybe();

        type Actor = { actor_id: number; first_name: string };

        const result = fakeQueryResult(q);

        result satisfies Actor | null;

        const coreResult = fakeQueryResultType(q);

        coreResult satisfies Actor;
    });

    test('Find one actor by ID', () => {
        const q = from('actor')
            .columns('actor_id', 'first_name', 'last_name', 'last_update')
            .filter({
                actor_id: 1,
            })
            .one();

        type Actor = {
            actor_id: number;
            first_name: string;
            last_name: string;
            last_update: string;
        };

        const result = fakeQueryResult(q);

        result satisfies Actor;

        const coreResult = fakeQueryResultType(q);

        coreResult satisfies Actor;

        expect(q.name).toMatchInlineSnapshot(`"actor-by-actor_id"`);
    });

    test('Find film with language and actors', () => {
        const language = from('language')
            .columns('language_id', 'name')
            .where({ language_id: col('film.language_id') })
            .maybe();

        expect(language.name).toMatchInlineSnapshot(
            `"language-by-language_id"`,
        );

        const filmActor = from('film_actor')
            .select({})
            .where({ film_id: col('film.film_id') })
            .many();

        const actors = from('actor')
            .columns('actor_id', 'first_name', 'last_name')
            .where({ actor_id: col('film_actor.actor_id') })
            .many();

        const q = from('film')
            .columns('film_id', 'language_id')
            .include({
                language,
                filmActor,
                actors,
            })
            .one();

        const result = fakeQueryResult(q);

        result satisfies {
            film_id: number;
            language_id: number;
            language: {
                language_id: number;
                name: string;
            } | null;
            actors: Array<{
                actor_id: number;
                first_name: string;
                last_name: string;
            }>;
        };
    });

    test('defer() with all()', () => {
        const q = from('customer').columns('email', 'first_name').defer().all();

        type Customer = { email: string | null; first_name: string };

        const result = fakeQueryResult(q);

        result satisfies DeferredResult<Array<Customer>>;

        const coreResult = fakeQueryResultType(q);

        coreResult satisfies Customer;
    });

    test('defer() with first()', () => {
        const q = from('customer')
            .columns('email', 'first_name')
            .defer()
            .first();

        type Customer = { email: string | null; first_name: string };

        const result = fakeQueryResult(q);

        result satisfies DeferredResult<Customer | null>;

        const coreResult = fakeQueryResultType(q);

        coreResult satisfies Customer;
    });

    test('defer() with firstOrThrow()', () => {
        const q = from('customer')
            .columns('email', 'first_name')
            .defer()
            .firstOrThrow();

        type Customer = { email: string | null; first_name: string };

        const result = fakeQueryResult(q);

        result satisfies DeferredResult<Customer>;

        const coreResult = fakeQueryResultType(q);

        coreResult satisfies Customer;
    });

    test('defer() ', () => {
        const language = from('language')
            .columns('name')
            .defer()
            .where({
                language_id: col('film.language_id'),
            })
            .first();

        const q = from('film').include({ language }).columns('title').all();

        type Language = {
            title: string;
            language: DeferredResult<{ name: string } | null>;
        };

        const result = fakeQueryResult(q);

        result satisfies Array<Language>;

        const coreResult = fakeQueryResultType(q);

        coreResult satisfies Language;

        expect(q.name).toMatchInlineSnapshot(`"film-all"`);
    });
});
