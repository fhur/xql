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

    test('Fetching a single row from the Pagila database with all selectable columns auto-selected', async () => {
        // @@start-example@@ Find a single actor by ID with all selectable columns auto-selected
        // @@desc@@ Finds 0 or 1 record(s) in the `actors` table where the `actor_id` is in the list of IDs passed, and return all selectable columns

        const q = from('actor')
            .where({ actor_id: { in: [1] } })
            .one();

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

    test('Fetching 0 or 1 rows(s) from the Pagila database with columns to return specified', async () => {
        // @@start-example@@ Find a single actor by ID with columns to return specified`
        // @@desc@@ Finds 0 or 1 record(s) in the `actors` table where the `actor_id` is in the list of IDs passed, and returns all selected columns

        const q = from('actor')
            .columns('actor_id', 'first_name', 'last_name')
            .where({ actor_id: { in: [1] } })
            .maybe();

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
        });
    }, 1000);

    test('Fetching a single row from the Pagila database with no filters specified', async () => {
        // @@start-example@@ Find a single actor with no filters specified
        // @@desc@@ Finds 0 or 1 record(s) in the `actors` table

        const q = from('actor')
            .columns('actor_id', 'first_name', 'last_name')
            .one();

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
        });
    }, 1000);

    test('Fetching a single row from the Pagila database with offset value specified', async () => {
        // @@start-example@@ Find a single actor with offset value specified
        // @@desc@@ Finds 0 or 1 record(s) in the `actors` starting from the offset value position

        const q = from('actor')
            .columns('actor_id', 'first_name', 'last_name')
            .offset(1)
            .one();

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
        });
    }, 1000);

    test('Fetching a single row from the Pagila database with limit of results to return specified', async () => {
        // @@start-example@@ Find a single actor with limit of results to return specified
        // @@desc@@ Finds n record(s) in the `actors`, where `n` is the value passed to `limit()`

        const q = from('actor')
            .columns('actor_id', 'first_name', 'last_name')
            .limit(2)
            .many();

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
            },
            {
                actor_id: 2,
                first_name: 'NICK',
                last_name: 'WAHLBERG',
            },
        ]);
    }, 1000);

    test('Fetching a single row from the Pagila database with number of results to take specified', async () => {
        // @@start-example@@ Find a single actor with number of results to take specified
        // @@desc@@ Finds n record(s) in the `actors`, where `n` is the value passed to `take()`

        const q = from('actor')
            .columns('actor_id', 'first_name', 'last_name')
            .take(2);

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
            },
            {
                actor_id: 2,
                first_name: 'NICK',
                last_name: 'WAHLBERG',
            },
        ]);
    }, 1000);

    test('Fetching `n` rows from the Pagila database with columns to return specified', async () => {
        const count = 10;
        const ids = Array(count)
            .fill(0)
            .map((_, i) => i + 1);

        // @@start-example@@ Find all actors by ids columns to return specified`
        // @@desc@@ Finds all the records in the `actors` table where their `id` is in the list of ids, and returns all selectable columns passed

        const q = from('actor')
            .columns('actor_id', 'first_name', 'last_name')
            .where({ actor_id: { in: ids } })
            .many();

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

    test('Fetching a single result from the Pagila database with single-level-deep nested data', async () => {
        // @@start-example@@ Find a single actor by ID with a single-level-deep `include()`
        // @@desc@@ Finds 1 record in the `customers` table where the `actor_id` is in the list of IDs passed

        const store = from('store')
            .columns(
                'store_id',
                'address_id',
                'manager_staff_id',
                'last_update',
            )
            .where({
                store_id: col('customer.store_id'),
            })
            .one();

        const q = from('customer')
            .columns(
                'customer_id',
                'store_id',
                'first_name',
                'last_name',
                'email',
                'last_update',
            )
            .where({ customer_id: { in: [1] } })
            .include({ store })
            .one();

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

    test('Fetching a single result from the Pagila database with two-level-deep nested data', async () => {
        // @@start-example@@ Find a single customer by ID with a two-level-deep `include()`
        // @@desc@@ Finds 1 record in the `customers` table where the `actor_id` is in the list of IDs passed

        const address = from('address')
            .columns(
                'address_id',
                'city_id',
                'address',
                'district',
                'last_update',
            )
            .where({
                address_id: col('store.address_id'),
            })
            .one();

        const store = from('store')
            .columns(
                'store_id',
                'address_id',
                'manager_staff_id',
                'last_update',
            )
            .where({
                store_id: col('customer.store_id'),
            })
            .include({ address })
            .one();

        const q = from('customer')
            .columns(
                'customer_id',
                'store_id',
                'first_name',
                'last_name',
                'email',
                'last_update',
            )
            .where({ customer_id: { in: [4] } })
            .include({ store })
            .one();

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

    test('Fetching a single result from the Pagila database with three-level-deep nested data', async () => {
        // @@start-example@@ Find a single customer by ID with a three-level-deep `include()`
        // @@desc@@ Finds 1 record in the `customers` table where the `actor_id` is in the list of IDs passed

        const city = from('city')
            .columns('city_id', 'country_id', 'city', 'last_update')
            .where({
                city_id: col('address.city_id'),
            })
            .one();

        const address = from('address')
            .columns(
                'address_id',
                'city_id',
                'address',
                'district',
                'last_update',
            )
            .where({
                address_id: col('store.address_id'),
            })
            .include({ city })
            .one();

        const store = from('store')
            .columns(
                'store_id',
                'address_id',
                'manager_staff_id',
                'last_update',
            )
            .where({
                store_id: col('customer.store_id'),
            })
            .include({ address })
            .one();

        const q = from('customer')
            .columns(
                'customer_id',
                'store_id',
                'first_name',
                'last_name',
                'email',
                'last_update',
            )
            .where({ customer_id: { in: [4] } })
            .include({ store })
            .one();

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

    test('Fetching a single result from the Pagila database with four-level-deep nested data', async () => {
        // @@start-example@@ Find a single customer by ID with a four-level-deep `include()`
        // @@desc@@ Finds 1 record in the `customers` table where the `actor_id` is in the list of IDs passed

        const country = from('country')
            .columns('country_id', 'country', 'last_update')
            .where({
                country_id: col('city.country_id'),
            })
            .one();

        const city = from('city')
            .columns('city_id', 'city', 'country_id', 'last_update')
            .where({
                city_id: col('address.city_id'),
            })
            .include({ country })
            .one();

        const address = from('address')
            .columns(
                'address_id',
                'city_id',
                'address',
                'district',
                'last_update',
            )
            .where({
                address_id: col('store.address_id'),
            })
            .include({ city })
            .one();

        const store = from('store')
            .columns(
                'store_id',
                'address_id',
                'manager_staff_id',
                'last_update',
            )
            .where({
                store_id: col('customer.store_id'),
            })
            .include({ address })
            .one();

        const q = from('customer')
            .columns(
                'customer_id',
                'store_id',
                'first_name',
                'last_name',
                'email',
                'last_update',
            )
            .where({ customer_id: { in: [4] } })
            .include({ store })
            .one();

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
