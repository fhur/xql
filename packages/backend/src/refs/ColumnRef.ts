import { AnyDB, RefOp } from '@synthql/queries';
import { escapeRef } from './escapeRef';
import { TableRef } from './TableRef';
import { ResultRow } from '../execution/types';

export class ColumnRef {
    public readonly tableRef: TableRef;
    public readonly column: string;

    constructor(tableRef: TableRef, column: string) {
        this.tableRef = tableRef;
        this.column = escapeRef(column, false);
    }

    /**
     * Example: "public::table".column
     */
    aliasQuoted() {
        return this.tableRef.aliasQuoted() + '.' + this.column;
    }

    canonical() {
        return this.tableRef.canonical() + '.' + `"${this.column}"`;
    }

    getValue(row: ResultRow) {
        const value = row[this.column];
        if (value === undefined) {
            throw new Error(`Column ${this.canonical()} not found in row`);
        }
        return value;
    }

    static fromRefOp(op: RefOp<AnyDB>, defaultSchema: string): ColumnRef {
        const table = TableRef.parse(op.$ref.table, defaultSchema);
        return table.column(op.$ref.column);
    }

    static parse(ref: string, defaultSchema: string): ColumnRef {
        const parts = ref.split('.');
        if (parts.length === 1) {
            throw new Error(`Invalid column reference ${ref}`);
        } else if (parts.length === 2) {
            const [table, column] = parts;
            return TableRef.parse(table, defaultSchema).column(column);
        } else if (parts.length === 3) {
            const [schema, table, column] = parts;
            return new TableRef(schema, table).column(column);
        }
        throw new Error(`Invalid column reference ${ref}`);
    }
}
