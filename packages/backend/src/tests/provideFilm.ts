import { QueryProvider } from '../QueryProvider';
import { assertArray } from '../util/asserts/assertArray';
import { assertPresent } from '../util/asserts/assertPresent';
import { DB } from './generated';
import { ColumnDataTypes } from './getColumnDataTypes';

type Film = ColumnDataTypes<DB['film']['columns']>;

const defaultFilms: Film[] = [
    {
        film_id: 4,
        title: 'Amelie',
        language_id: 2,
        replacement_cost: '1.99',
        rental_duration: 1,
        rental_rate: '1.99',
        last_update: new Date().toISOString(),
        fulltext: '',
        description: null,
        original_language_id: null,
        rating: null,
        release_year: null,
        special_features: null,
        length: null,
    },
    {
        film_id: 1,
        title: 'The Matrix',
        language_id: 1,
        replacement_cost: '1.99',
        rental_duration: 1,
        rental_rate: '1.99',
        last_update: new Date().toISOString(),
        fulltext: '',
        description: null,
        original_language_id: null,
        rating: null,
        release_year: null,
        special_features: null,
        length: null,
    },
    {
        film_id: 2,
        title: 'The Matrix Reloaded',
        language_id: 1,
        replacement_cost: '1.99',
        rental_duration: 1,
        rental_rate: '1.99',
        last_update: new Date().toISOString(),
        fulltext: '',
        description: null,
        original_language_id: null,
        rating: null,
        release_year: null,
        special_features: null,
        length: null,
    },
    {
        film_id: 3,
        title: 'The Matrix Revolutions',
        language_id: 1,
        replacement_cost: '1.99',
        rental_duration: 1,
        rental_rate: '1.99',
        last_update: new Date().toISOString(),
        fulltext: '',
        description: null,
        original_language_id: null,
        rating: null,
        release_year: null,
        special_features: null,
        length: null,
    },
];

export function provideFilm(films = defaultFilms): QueryProvider<DB, 'film'> {
    return {
        table: 'film',
        execute: async ({ film_id: filmIds }): Promise<Film[]> => {
            assertPresent(filmIds);

            assertArray(filmIds);

            if (filmIds.length === 0) {
                return films;
            }

            return films.filter((f) => filmIds.includes(f.film_id));
        },
    };
}
