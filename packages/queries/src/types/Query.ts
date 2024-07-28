import { Table } from './Table';
import { Select } from './Select';
import { Where } from './Where';
import { Include } from './Include';
import { Exp } from '../expression/Exp';

export type Query<DB, TTable extends Table<DB> = Table<DB>> = {
    from: TTable;
    select: Select<DB, TTable>;
    where: Where<DB, TTable>;
    include?: Include<DB>;
    limit?: number;
    offset?: number;
    cardinality?: 'one' | 'maybe' | 'many';
    lazy?: true;
    groupBy?: string[];
    aggregates?: {
        [key: string]: Exp;
    };
};
