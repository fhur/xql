import { Schema, Table } from '@synthql/queries';
import { getTableDef } from './getTableDef';
import { getColumnDef } from './getColumnDef';
import { isDateColumn } from './isDateColumn';

export function checkIfDateColumn<DB>({
    schema,
    table,
    column,
}: {
    schema: Schema<DB>;
    table: Table<DB>;
    column: string;
}): boolean {
    const tableDef = getTableDef(schema, table);

    const columnDef = getColumnDef(tableDef, column);

    return isDateColumn(columnDef);
}
