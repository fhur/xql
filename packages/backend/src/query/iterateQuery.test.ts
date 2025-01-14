import { describe, expect, test } from 'vitest';
import { AnyQuery, col } from '@synthql/queries';
import { from } from '../tests/generated';
import { iterateQuery } from './iterateQuery';
import { Path } from '../execution/types';

describe('iterateQuery', () => {
    const cases: Array<{
        input: AnyQuery;
        expected: Array<{
            query: AnyQuery;
            insertionPath: Path;
        }>;
    }> = [
        {
            input: from('film').many(),
            expected: [{ query: from('film').many(), insertionPath: [] }],
        },
        {
            input: from('film')
                .include({
                    lang: from('language')
                        .where({
                            language_id: col('film.language_id'),
                        })
                        .many(),
                })
                .many(),

            expected: [
                {
                    query: from('film')
                        .include({
                            lang: from('language')
                                .where({
                                    language_id: col('film.language_id'),
                                })
                                .many(),
                        })
                        .many(),
                    insertionPath: [],
                },
                {
                    query: from('language')
                        .where({
                            language_id: col('film.language_id'),
                        })
                        .many(),
                    insertionPath: ['lang'],
                },
            ],
        },

        {
            input: from('film')
                .include({
                    lang: from('language')
                        .where({
                            language_id: col('film.language_id'),
                        })
                        .many(),
                    actors: from('actor')
                        .where({
                            actor_id: col('film_actor.actor_id'),
                        })
                        .many(),
                })
                .many(),

            expected: [
                {
                    query: from('film')
                        .include({
                            lang: from('language')
                                .where({
                                    language_id: col('film.language_id'),
                                })
                                .many(),
                            actors: from('actor')
                                .where({
                                    actor_id: col('film_actor.actor_id'),
                                })
                                .many(),
                        })
                        .many(),
                    insertionPath: [],
                },
                {
                    query: from('actor')
                        .where({
                            actor_id: col('film_actor.actor_id'),
                        })
                        .many(),
                    insertionPath: ['actors'],
                },
                {
                    query: from('language')
                        .where({
                            language_id: col('film.language_id'),
                        })
                        .many(),
                    insertionPath: ['lang'],
                },
            ],
        },

        {
            input: from('film')
                .include({
                    lang: from('language')
                        .where({
                            language_id: col('film.language_id'),
                        })
                        .many(),
                    actors: from('actor')
                        .where({
                            actor_id: col('film_actor.actor_id'),
                        })
                        .include({
                            lang: from('language')
                                .where({
                                    language_id: col('film.language_id'),
                                })
                                .many(),
                        })
                        .many(),
                })
                .many(),

            expected: [
                {
                    query: from('film')
                        .include({
                            lang: from('language')
                                .where({
                                    language_id: col('film.language_id'),
                                })
                                .many(),
                            actors: from('actor')
                                .where({
                                    actor_id: col('film_actor.actor_id'),
                                })
                                .include({
                                    lang: from('language')
                                        .where({
                                            language_id:
                                                col('film.language_id'),
                                        })
                                        .many(),
                                })
                                .many(),
                        })
                        .many(),
                    insertionPath: [],
                },
                {
                    query: from('actor')
                        .where({
                            actor_id: col('film_actor.actor_id'),
                        })
                        .include({
                            lang: from('language')
                                .where({
                                    language_id: col('film.language_id'),
                                })
                                .many(),
                        })
                        .many(),
                    insertionPath: ['actors'],
                },
                {
                    query: from('language')
                        .where({
                            language_id: col('film.language_id'),
                        })
                        .many(),
                    insertionPath: ['actors', 'lang'],
                },
                {
                    query: from('language')
                        .where({
                            language_id: col('film.language_id'),
                        })
                        .many(),
                    insertionPath: ['lang'],
                },
            ],
        },

        {
            input: {
                from: 'film',
                select: {},
                where: {
                    film_id: 1,
                },
                cardinality: 'many',
            },
            expected: [
                {
                    query: {
                        from: 'film',
                        select: {},
                        where: { film_id: 1 },
                        cardinality: 'many',
                    },
                    insertionPath: [],
                },
            ],
        },
    ];

    test.each(cases)('iterateQuery #%#', ({ input, expected }) => {
        expect(Array.from(iterateQuery(input))).toMatchObject(expected);
    });
});
