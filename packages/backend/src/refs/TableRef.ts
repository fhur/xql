import { AnyQuery } from '@synthql/queries';
import { escapeRef } from './escapeRef';
import { ColumnRef } from './ColumnRef';

export class TableRef {
    public readonly schema: string;
    public readonly table: string;

    constructor(schema: string, table: string) {
        this.schema = escapeRef(schema, false);
        this.table = escapeRef(table, false);
    }

    static parse(ref: string, defaultSchema: string): TableRef {
        try {
            const parts = ref.split('.');
            if (parts.length === 1) {
                return new TableRef(defaultSchema, parts[0]);
            } else if (parts.length === 2) {
                return new TableRef(parts[0], parts[1]);
            } else {
                throw new Error(`Invalid table reference ${ref}`);
            }
        } catch (e) {
            throw new Error(
                `Failed to parse ${ref} into a table using default schema ${defaultSchema}`,
            );
        }
    }

    static fromQuery(defaultSchema: string, query: AnyQuery) {
        return this.parse(query.from, defaultSchema);
    }

    column(column: string): ColumnRef {
        return new ColumnRef(this, column);
    }

    /**
     * Returns the table reference in the form of schema.table, without quotes.
     * @returns Example: "public"."films"
     */
    canonical() {
        return `"${this.schema}"` + '.' + `"${this.table}"`;
    }

    /**
     * Returns the table reference in the form of schema::table, without quotes.
     * @see aliasQuoted for a quoted version
     * @returns Example: public::films
     */
    alias() {
        return this.schema + '::' + this.table;
    }

    /**
     * @returns Example: "public::table"
     */
    aliasQuoted() {
        return `"${this.alias()}"`;
    }

    equals(other: TableRef): boolean {
        return this.schema === other.schema && this.table === other.table;
    }
}
