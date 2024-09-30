import { describe, expect, test } from 'vitest';
import { ColumnRef } from '../refs/ColumnRef';
import { createRefContext } from '../refs/RefContext';
import { col, from } from '../tests/generated';
import { resolveReferences } from './resolveReferences';

describe('resolveReferences', () => {
    test('should resolve references', async () => {
        const columnLangId = ColumnRef.parse('film.language_id', 'public');
        const refContext = createRefContext();
        refContext.addValues(columnLangId, 1, 2, 3, 1, 2, 3);

        const q = from('language')
            .columns('name')
            .where({ language_id: col('film.language_id') })
            .many();
        const out = resolveReferences(q, refContext, 'public');

        expect(out.where).toEqual({
            language_id: {
                in: [1, 2, 3],
            },
        });
    });
});
