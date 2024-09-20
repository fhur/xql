import { AnyQuery } from '@synthql/queries';
import { applyCardinality } from '../../../../query/applyCardinality';
import {
    SqlBuilder,
    as,
    coalesce,
    compileExp,
    jsonb,
    jsonbAgg,
    distinct,
} from './exp';
import { TableRef } from '../../../../refs/TableRef';
import { Selection } from './types';

export class SelectionJsonbAgg implements Selection {
    private includedKeys: Set<string>;

    private constructor(
        public readonly selectionId: string,
        public readonly tableRef: TableRef,
        public readonly subQuery: AnyQuery,
    ) {
        const includedKeys = Object.entries(this.subQuery.select)
            .filter(([key, value]) => value === true)
            .map(([key, value]) => key);
        this.includedKeys = new Set(includedKeys);
    }

    static fromQuery(
        rootQuery: AnyQuery,
        defaultSchema: string,
    ): SelectionJsonbAgg[] {
        if (rootQuery.include === undefined) {
            return [];
        }
        const result: SelectionJsonbAgg[] = [];
        for (const [selectionId, subQuery] of Object.entries(
            rootQuery.include,
        )) {
            result.push(
                new SelectionJsonbAgg(
                    selectionId,
                    TableRef.fromQuery(defaultSchema, subQuery),
                    subQuery,
                ),
            );
        }
        return result;
    }

    toSql(): SqlBuilder {
        const agg = coalesce(
            jsonbAgg(distinct(this.tableRef.aliasQuoted())),
            jsonb('[]'),
        );

        const asSelectionId = as(agg, this.selectionId);

        return compileExp(asSelectionId);
    }

    extractFromRow(row: any, target: any): void {
        if (this.includedKeys.size === 0) {
            return;
        }
        // TODO assert prescence
        const tmp = row[this.selectionId];
        if (tmp === undefined) {
            throw new Error(
                `Column ${this.selectionId} not found in row ${JSON.stringify(row)}`,
            );
        }
        if (!Array.isArray(tmp)) {
            throw new Error(
                `Column ${this.selectionId} is not an array: ${JSON.stringify(tmp)}`,
            );
        }

        target[this.selectionId] = applyCardinality(
            tmp
                .filter((x) => x !== null)
                .map((values) => {
                    // include only the keys that are included in the subquery
                    const result: any = {};
                    for (const key of this.includedKeys) {
                        result[key] = tryToGet(values, key, row);
                    }
                    return result;
                }),
            this.subQuery.cardinality ?? 'many',
        );
    }
}

function tryToGet(obj: unknown, key: string, row: unknown): unknown {
    if (obj === null || obj === undefined) {
        throw new Error(`Object is null or undefined: ${row}`);
    }
    if (typeof obj !== 'object') {
        throw new Error(`Object is not an object: ${row}`);
    }
    const result = (obj as any)[key];
    return result;
}
