import { Schema, Table } from '@synthql/queries';
import { getTableDef } from './getTableDef';
import { getColumnDef } from './getColumnDef';
import { isEnumColumn } from './isEnumColumn';

export function checkIfEnumColumn<DB>({
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

    return isEnumColumn(columnDef);
}
