import React from 'react';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useSynthql } from '.';
import { PagilaServer, createPagilaServer } from './test/createPagilaServer';
import { DB, from } from './test/generated';
import { Providers } from './test/Providers';
import { QueryEngine } from '@synthql/backend';
import { col, Query, Table } from '@synthql/queries';

function renderSynthqlQuery<
    DB,
    TTable extends Table<DB>,
    TQuery extends Query<DB, TTable>,
>({
    query,
    returnLastOnly,
    server,
}: {
    query: TQuery;
    returnLastOnly?: boolean;
    server: PagilaServer | undefined;
}) {
    const result = renderHook(
        () => {
            const result = useSynthql<DB, TTable, typeof query>(query, {
                returnLastOnly,
            });

            return result;
        },
        {
            wrapper: (props: React.PropsWithChildren) => {
                return <Providers endpoint={server?.url!} {...props} />;
            },
        },
    );

    return result;
}

describe('useSynthql', () => {
    let pagilaServer: PagilaServer | undefined;

    beforeAll(async () => {
        const queryEngine = new QueryEngine({
            url: 'postgres://postgres:postgres@localhost:5432/postgres',
        });

        pagilaServer = await createPagilaServer({ queryEngine });
    });

    afterAll(() => {
        pagilaServer?.server.close();
    });

    test('Fetching 1 row from the Pagila database, with all selectable columns auto-selected, and no filters specified', async () => {
        // @@start-example@@ Find 1 actor, with all selectable columns auto-selected, and no filters specified
        // @@desc@@ Finds 1 record in the `actor` table

        const q = from('actor').firstOrThrow();

        // @@end-example@@

        const result = renderSynthqlQuery<DB, 'actor', typeof q>({
            query: q,
            server: pagilaServer,
        });

        await result.waitFor(() => result.result.current.data !== undefined);

        expect(result.result.current.data).toEqual({
            actor_id: 1,
            first_name: 'PENELOPE',
            last_name: 'GUINESS',
            last_update: '2022-02-15 09:34:33+00',
        });
    }, 1000);

    test('Fetching 0 or 1 rows(s) from the Pagila database, with all selectable columns auto-selected, and no filters specified', async () => {
        // @@start-example@@ Find 0 or 1 actor(s), with all selectable columns auto-selected, and no filters specified
        // @@desc@@ Finds 0 or 1 record(s) in the `actor` table

        const q = from('actor').first();

        // @@end-example@@

        const result = renderSynthqlQuery<DB, 'actor', typeof q>({
            query: q,
            server: pagilaServer,
        });

        await result.waitFor(() => result.result.current.data !== undefined);

        expect(result.result.current.data).toEqual({
            actor_id: 1,
            first_name: 'PENELOPE',
            last_name: 'GUINESS',
            last_update: '2022-02-15 09:34:33+00',
        });
    }, 1000);

    test('Fetching 1 row from the Pagila database, with all selectable columns auto-selected', async () => {
        // @@start-example@@ Find 1 actor by ID, with all selectable columns auto-selected
        // @@desc@@ Finds 1 record in the `actor` table where the `actor_id` is in the list of IDs passed, and returns all selectable columns

        const q = from('actor')
            .filter({ actor_id: { in: [1] } })
            .firstOrThrow();

        // @@end-example@@

        const result = renderSynthqlQuery<DB, 'actor', typeof q>({
            query: q,
            server: pagilaServer,
        });

        await result.waitFor(() => result.result.current.data !== undefined);

        expect(result.result.current.data).toEqual({
            actor_id: 1,
            first_name: 'PENELOPE',
            last_name: 'GUINESS',
            last_update: '2022-02-15 09:34:33+00',
        });
    }, 1000);

    test('Fetching 0 or 1 rows(s) from the Pagila database, with all selectable columns auto-selected', async () => {
        // @@start-example@@ Find 0 or 1 actor(s) by ID, with all selectable columns auto-selected
        // @@desc@@ Finds 0 or 1 record(s) in the `actor` table where the `actor_id` is in the list of IDs passed, and returns all selectable columns

        const q = from('actor')
            .filter({ actor_id: { in: [1] } })
            .first();

        // @@end-example@@

        const result = renderSynthqlQuery<DB, 'actor', typeof q>({
            query: q,
            server: pagilaServer,
        });

        await result.waitFor(() => result.result.current.data !== undefined);

        expect(result.result.current.data).toEqual({
            actor_id: 1,
            first_name: 'PENELOPE',
            last_name: 'GUINESS',
            last_update: '2022-02-15 09:34:33+00',
        });
    }, 1000);

    test('Fetching `n` rows from the Pagila database with columns to return specified', async () => {
        const count = 10;
        const ids = Array(count)
            .fill(0)
            .map((_, i) => i + 1);

        // @@start-example@@ Find 0 through n actor(s) by IDs, with columns to return specified
        // @@desc@@ Finds 0 through n record(s) in the `actor` table where their `actor_id` is in the list of IDs passed, and returns all selected columns

        const q = from('actor')
            .columns('actor_id', 'first_name', 'last_name')
            .filter({ actor_id: { in: ids } })
            .all();

        // @@end-example@@

        const result = renderSynthqlQuery<DB, 'actor', typeof q>({
            query: q,
            server: pagilaServer,
        });

        await result.waitFor(() => result.result.current.data !== undefined);

        expect(
            result.result.current.data?.sort((a, b) => a.actor_id - b.actor_id),
        ).toMatchInlineSnapshot(`
          [
            {
              "actor_id": 1,
              "first_name": "PENELOPE",
              "last_name": "GUINESS",
            },
            {
              "actor_id": 2,
              "first_name": "NICK",
              "last_name": "WAHLBERG",
            },
            {
              "actor_id": 3,
              "first_name": "ED",
              "last_name": "CHASE",
            },
            {
              "actor_id": 4,
              "first_name": "JENNIFER",
              "last_name": "DAVIS",
            },
            {
              "actor_id": 5,
              "first_name": "JOHNNY",
              "last_name": "LOLLOBRIGIDA",
            },
            {
              "actor_id": 6,
              "first_name": "BETTE",
              "last_name": "NICHOLSON",
            },
            {
              "actor_id": 7,
              "first_name": "GRACE",
              "last_name": "MOSTEL",
            },
            {
              "actor_id": 8,
              "first_name": "MATTHEW",
              "last_name": "JOHANSSON",
            },
            {
              "actor_id": 9,
              "first_name": "JOE",
              "last_name": "SWANK",
            },
            {
              "actor_id": 10,
              "first_name": "CHRISTIAN",
              "last_name": "GABLE",
            },
          ]
        `);
    }, 1000);

    test('Fetching `n` rows from the Pagila database with `limit(n)` of results to return specified', async () => {
        // @@start-example@@ Find 0 through n actor(s)  with `limit(n)` of results to return specified
        // @@desc@@ Finds 0 through n record(s) in the `actor` table, where `n` is the value passed to `limit()`

        const q = from('actor').limit(2).all();

        // @@end-example@@

        const result = renderSynthqlQuery<DB, 'actor', typeof q>({
            query: q,
            server: pagilaServer,
        });

        await result.waitFor(() => result.result.current.data !== undefined);

        expect(result.result.current.data?.length).toEqual(2);

        expect(result.result.current.data).toEqual([
            {
                actor_id: 1,
                first_name: 'PENELOPE',
                last_name: 'GUINESS',
                last_update: '2022-02-15 09:34:33+00',
            },
            {
                actor_id: 2,
                first_name: 'NICK',
                last_name: 'WAHLBERG',
                last_update: '2022-02-15 09:34:33+00',
            },
        ]);
    }, 1000);

    test('Fetching `n` rows from the Pagila database with number of results to `take(n)` (shorthand for `.limit(n).all()`) specified', async () => {
        // @@start-example@@ Find 0 through n actor(s) with number of results to `take(n)` (shorthand for `.limit(n).all()`) specified
        // @@desc@@ Finds 0 through n record(s) in the `actor` table, where `n` is the value passed to `take()`

        const q = from('actor').take(2);

        // @@end-example@@

        const result = renderSynthqlQuery<DB, 'actor', typeof q>({
            query: q,
            server: pagilaServer,
        });

        await result.waitFor(() => result.result.current.data !== undefined);

        expect(result.result.current.data?.length).toEqual(2);

        expect(result.result.current.data).toEqual([
            {
                actor_id: 1,
                first_name: 'PENELOPE',
                last_name: 'GUINESS',
                last_update: '2022-02-15 09:34:33+00',
            },
            {
                actor_id: 2,
                first_name: 'NICK',
                last_name: 'WAHLBERG',
                last_update: '2022-02-15 09:34:33+00',
            },
        ]);
    }, 1000);

    test('Fetching 1 row from the Pagila database with `offset(n)` (offset value) specified', async () => {
        // @@start-example@@ Find 1 actor with `offset(n)` (offset value) specified
        // @@desc@@ Finds 1 record in the `actor` table, starting from the `offset(n)` (offset value) position

        const q = from('actor').offset(1).firstOrThrow();

        // @@end-example@@

        const result = renderSynthqlQuery<DB, 'actor', typeof q>({
            query: q,
            server: pagilaServer,
        });

        await result.waitFor(() => result.result.current.data !== undefined);

        expect(result.result.current.data).toEqual({
            actor_id: 2,
            first_name: 'NICK',
            last_name: 'WAHLBERG',
            last_update: '2022-02-15 09:34:33+00',
        });
    }, 1000);

    test('Fetching 1 row from the Pagila database with single-level-deep nested data', async () => {
        // @@start-example@@ Find 1 customer by ID with a single-level-deep `include()`
        // @@desc@@ Finds 1 record in the `customers` table where the `actor_id` is in the list of IDs passed

        const store = from('store')
            .columns(
                'store_id',
                'address_id',
                'manager_staff_id',
                'last_update',
            )
            .filter({
                store_id: col('customer.store_id'),
            })
            .firstOrThrow();

        const q = from('customer')
            .columns(
                'customer_id',
                'store_id',
                'first_name',
                'last_name',
                'email',
                'last_update',
            )
            .filter({ customer_id: { in: [1] } })
            .include({ store })
            .firstOrThrow();

        // @@end-example@@

        const result = renderSynthqlQuery<DB, 'customer', typeof q>({
            query: q,
            server: pagilaServer,
        });

        await result.waitFor(() => result.result.current.data !== undefined);

        expect(result.result.current.data).toEqual({
            customer_id: 1,
            store_id: 1,
            first_name: 'MARY',
            last_name: 'SMITH',
            email: 'MARY.SMITH@sakilacustomer.org',
            last_update: '2022-02-15 09:57:20+00',
            store: {
                store_id: 1,
                address_id: 129,
                manager_staff_id: 1,
                last_update: '2022-02-15T09:57:12+00:00',
            },
        });
    }, 1000);

    test('Fetching 1 row from the Pagila database with two-level-deep nested data', async () => {
        // @@start-example@@ Find 1 customer by ID with a two-level-deep `include()`
        // @@desc@@ Finds 1 record in the `customers` table where the `actor_id` is in the list of IDs passed

        const address = from('address')
            .columns(
                'address_id',
                'city_id',
                'address',
                'district',
                'last_update',
            )
            .filter({
                address_id: col('store.address_id'),
            })
            .firstOrThrow();

        const store = from('store')
            .columns(
                'store_id',
                'address_id',
                'manager_staff_id',
                'last_update',
            )
            .filter({
                store_id: col('customer.store_id'),
            })
            .include({ address })
            .firstOrThrow();

        const q = from('customer')
            .columns(
                'customer_id',
                'store_id',
                'first_name',
                'last_name',
                'email',
                'last_update',
            )
            .filter({ customer_id: { in: [4] } })
            .include({ store })
            .firstOrThrow();

        // @@end-example@@

        const result = renderSynthqlQuery<DB, 'customer', typeof q>({
            query: q,
            returnLastOnly: true,
            server: pagilaServer,
        });

        await result.waitFor(() => result.result.current.data !== undefined);

        expect(result.result.current.data).toEqual({
            customer_id: 4,
            store_id: 2,
            first_name: 'BARBARA',
            last_name: 'JONES',
            email: 'BARBARA.JONES@sakilacustomer.org',
            last_update: '2022-02-15 09:57:20+00',
            store: {
                store_id: 2,
                address_id: 12,
                manager_staff_id: 2,
                last_update: '2022-02-15T09:57:12+00:00',
                address: {
                    address_id: 12,
                    city_id: 200,
                    address: '478 Joliet Way',
                    district: 'Hamilton',
                    last_update: '2022-02-15 09:45:30+00',
                },
            },
        });
    }, 1000);

    test('Fetching 1 row from the Pagila database with three-level-deep nested data', async () => {
        // @@start-example@@ Find 1 customer by ID with a three-level-deep `include()`
        // @@desc@@ Finds 1 record in the `customers` table where the `actor_id` is in the list of IDs passed

        const city = from('city')
            .columns('city_id', 'country_id', 'city', 'last_update')
            .filter({
                city_id: col('address.city_id'),
            })
            .firstOrThrow();

        const address = from('address')
            .columns(
                'address_id',
                'city_id',
                'address',
                'district',
                'last_update',
            )
            .filter({
                address_id: col('store.address_id'),
            })
            .include({ city })
            .firstOrThrow();

        const store = from('store')
            .columns(
                'store_id',
                'address_id',
                'manager_staff_id',
                'last_update',
            )
            .filter({
                store_id: col('customer.store_id'),
            })
            .include({ address })
            .firstOrThrow();

        const q = from('customer')
            .columns(
                'customer_id',
                'store_id',
                'first_name',
                'last_name',
                'email',
                'last_update',
            )
            .filter({ customer_id: { in: [4] } })
            .include({ store })
            .firstOrThrow();

        // @@end-example@@

        const result = renderSynthqlQuery<DB, 'customer', typeof q>({
            query: q,
            returnLastOnly: true,
            server: pagilaServer,
        });

        await result.waitFor(() => result.result.current.data !== undefined);

        expect(result.result.current.data).toEqual({
            customer_id: 4,
            store_id: 2,
            first_name: 'BARBARA',
            last_name: 'JONES',
            email: 'BARBARA.JONES@sakilacustomer.org',
            last_update: '2022-02-15 09:57:20+00',
            store: {
                store_id: 2,
                address_id: 12,
                manager_staff_id: 2,
                last_update: '2022-02-15T09:57:12+00:00',
                address: {
                    address_id: 12,
                    city_id: 200,
                    address: '478 Joliet Way',
                    district: 'Hamilton',
                    last_update: '2022-02-15 09:45:30+00',
                    city: {
                        city_id: 200,
                        country_id: 68,
                        city: 'Hamilton',
                        last_update: '2022-02-15T09:45:25+00:00',
                    },
                },
            },
        });
    }, 1000);

    test('Fetching 1 row from the Pagila database with four-level-deep nested data', async () => {
        // @@start-example@@ Find 1 customer by ID with a four-level-deep `include()`
        // @@desc@@ Finds 1 record in the `customers` table where the `actor_id` is in the list of IDs passed

        const country = from('country')
            .columns('country_id', 'country', 'last_update')
            .filter({
                country_id: col('city.country_id'),
            })
            .firstOrThrow();

        const city = from('city')
            .columns('city_id', 'city', 'country_id', 'last_update')
            .filter({
                city_id: col('address.city_id'),
            })
            .include({ country })
            .firstOrThrow();

        const address = from('address')
            .columns(
                'address_id',
                'city_id',
                'address',
                'district',
                'last_update',
            )
            .filter({
                address_id: col('store.address_id'),
            })
            .include({ city })
            .firstOrThrow();

        const store = from('store')
            .columns(
                'store_id',
                'address_id',
                'manager_staff_id',
                'last_update',
            )
            .filter({
                store_id: col('customer.store_id'),
            })
            .include({ address })
            .firstOrThrow();

        const q = from('customer')
            .columns(
                'customer_id',
                'store_id',
                'first_name',
                'last_name',
                'email',
                'last_update',
            )
            .filter({ customer_id: { in: [4] } })
            .include({ store })
            .firstOrThrow();

        // @@end-example@@

        const result = renderSynthqlQuery<DB, 'customer', typeof q>({
            query: q,
            returnLastOnly: true,
            server: pagilaServer,
        });

        await result.waitFor(() => result.result.current.data !== undefined);

        expect(result.result.current.data).toEqual({
            customer_id: 4,
            store_id: 2,
            first_name: 'BARBARA',
            last_name: 'JONES',
            email: 'BARBARA.JONES@sakilacustomer.org',
            last_update: '2022-02-15 09:57:20+00',
            store: {
                store_id: 2,
                address_id: 12,
                manager_staff_id: 2,
                last_update: '2022-02-15T09:57:12+00:00',
                address: {
                    address_id: 12,
                    city_id: 200,
                    address: '478 Joliet Way',
                    district: 'Hamilton',
                    last_update: '2022-02-15 09:45:30+00',
                    city: {
                        city_id: 200,
                        country_id: 68,
                        city: 'Hamilton',
                        last_update: '2022-02-15T09:45:25+00:00',
                        country: {
                            country: 'New Zealand',
                            country_id: 68,
                            last_update: '2022-02-15 09:44:00+00',
                        },
                    },
                },
            },
        });
    }, 1000);
});
