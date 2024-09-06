import { AnyQuery } from '@synthql/queries';
import { Path } from '../execution/types';
import { setIn } from '../util/tree/setIn';
import { getIn } from '../util/tree/getIn';

interface QueryIterItem<TQuery extends AnyQuery> {
    /**
     * The query being iterated over
     */
    query: TQuery;

    /**
     * The parent query of the current query
     */
    parentQuery?: TQuery;

    includeKey?: string;
    /**
     * The insertion path.
     *
     * An insertion path can be used by functions such as {@link setIn} or {@link getIn} to set or get a value from the QueryResult.
     *
     * Example:
     *
     * ```
     * [star, 'actors', star, 'lang', star]
     * ```
     */
    insertionPath: Path;

    /**
     * The depth of the query in the query tree. The root query has a depth of 0.
     */
    depth: number;
}

/**
 * Iterate over a query and its subqueries
 *
 *
 */
export function* iterateQuery<TQuery extends AnyQuery>(
    query: TQuery,
): Generator<QueryIterItem<TQuery>> {
    const stack: QueryIterItem<TQuery>[] = [
        { query, insertionPath: [], depth: 0 },
    ];

    while (stack.length > 0) {
        const { query, insertionPath, includeKey, parentQuery, depth } =
            stack.pop()!;

        yield { query, insertionPath, includeKey, parentQuery, depth };

        for (const [includeKey, subQuery] of Object.entries(
            query.include ?? {},
        )) {
            const newPath = [...insertionPath, includeKey];

            stack.push({
                query: subQuery as TQuery,
                insertionPath: newPath,
                parentQuery: query,
                includeKey,
                depth: depth + 1,
            });
        }
    }
}
