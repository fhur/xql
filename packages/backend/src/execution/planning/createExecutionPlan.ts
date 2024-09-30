import { Query } from '@synthql/queries';
import { collectColumnReferences } from '../../query/collectColumnReferences';
import { createRefContext } from '../../refs/RefContext';
import { ExecuteProps } from '../execute';
import { ExecPlanTree } from '../types';
import { assignExecutors } from './assignExecutors';
import { createPlanningQuery } from './createPlanningQuery';

export function createExecutionPlan(
    query: Query,
    props: ExecuteProps,
): ExecPlanTree {
    const { defaultSchema } = props;
    // Create an empty ref context.
    const refContext = createRefContext();
    const allColumns = collectColumnReferences(query, defaultSchema);

    // Collect all references in the query, but add no values as we don't have any yet.
    // Values will be added during the execution phase.
    for (const { column } of allColumns) {
        refContext.addValues(column);
    }

    const planningQuery = createPlanningQuery(query);

    const root = assignExecutors(
        planningQuery,
        allColumns.map((c) => c.column),
        props,
    );

    return {
        root,
        refContext,
    };
}
