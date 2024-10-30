import { Query } from './types';
import { ColumnValue } from './ColumnValue';
import { Column } from './Column';
import { Table } from './Table';

export type QueryResult<DB, TQuery> = Simplify<
    TQuery extends Query<DB, infer TTable>
        ? ApplyDeferredQueryResult<DB, TTable, TQuery>
        : never
>;

export type QueryResultType<DB, TQuery> =
    TQuery extends Query<DB, infer TTable>
        ? TQuery extends { cardinality: 'many' }
            ? TQuery extends { lazy: true }
                ? Simplify<ApplyCardinality<DB, TTable, TQuery>>[0]
                : QueryResult<DB, TQuery>[0]
            : TQuery extends { cardinality: 'maybe' }
              ? TQuery extends { lazy: true }
                  ? Exclude<
                        Simplify<ApplyCardinality<DB, TTable, TQuery>>,
                        null
                    >
                  : Exclude<QueryResult<DB, TQuery>, null>
              : TQuery extends { lazy: true }
                ? Simplify<ApplyCardinality<DB, TTable, TQuery>>
                : QueryResult<DB, TQuery>
        : never;

type Simplify<T> =
    T extends Array<infer U>
        ? Simplify<U>[]
        : T extends Date
          ? T
          : T extends object
            ? { [K in keyof T]: Simplify<T[K]> }
            : T;

type QueryResultInner<
    DB,
    TTable extends Table<DB>,
    TQuery extends Query<DB, TTable>,
> = QueryResultFromSelect<DB, TTable, TQuery> &
    QueryResultFromInclude<DB, TTable, TQuery>;

type QueryResultFromSelect<
    DB,
    TTable extends Table<DB>,
    TQuery extends Query<DB, TTable>,
> = {
    [TCol in SelectedColumns<DB, TTable, TQuery>]: ColumnValue<
        DB,
        TTable,
        TCol
    >;
};

type SelectedColumns<
    DB,
    TTable extends Table<DB>,
    TQuery extends Query<DB, TTable>,
> = TQuery['select'] extends true
    ? // Select all columns
      Column<DB, TTable>
    : // Select only the specified columns
      Column<DB, TTable> & keyof TQuery['select'];

type IncludedColumns<
    DB,
    TTable extends Table<DB>,
    TQuery extends Query<DB, TTable>,
> = keyof TQuery['include'];

type QueryResultFromInclude<
    DB,
    TTable extends Table<DB>,
    TQuery extends Query<DB, TTable>,
> = {
    [TCol in IncludedColumns<DB, TTable, TQuery>]: QueryResult<
        DB,
        TQuery['include'][TCol]
    >;
};

export type DeferredResult<T> =
    | { status: 'pending' }
    | { status: 'done'; data: T }
    | { status: 'error'; error: unknown };

type ApplyDeferredQueryResult<
    DB,
    TTable extends Table<DB>,
    TQuery extends Query<DB, TTable>,
> = TQuery extends { lazy: true }
    ? DeferredResult<ApplyCardinality<DB, TTable, TQuery>>
    : ApplyCardinality<DB, TTable, TQuery>;

type MaybeQueryResult<
    DB,
    TTable extends Table<DB>,
    TQuery extends Query<DB, TTable>,
> = null | QueryResultInner<DB, TTable, TQuery>;

type ManyQueryResult<
    DB,
    TTable extends Table<DB>,
    TQuery extends Query<DB, TTable>,
> = QueryResultInner<DB, TTable, TQuery>[];

type ApplyCardinality<
    DB,
    TTable extends Table<DB>,
    TQuery extends Query<DB, TTable>,
> =
    // prettier-ignore
    // Case 1: many
    TQuery extends { cardinality: 'many' }
    ? ManyQueryResult<DB, TTable, TQuery>

    : // Case 2: undefined cardinality
    TQuery['cardinality'] extends undefined
    ? ManyQueryResult<DB, TTable, TQuery>

    : // Case 3: one
    TQuery extends { cardinality: 'one' }
    ? QueryResultInner<DB, TTable, TQuery>

    : // Case 4: maybe
    TQuery extends { cardinality: 'maybe' }
    ? MaybeQueryResult<DB, TTable, TQuery>

    : // Else
    never;
