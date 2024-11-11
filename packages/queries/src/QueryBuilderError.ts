import { AnyQuery } from './types/AnyQuery';

export class QueryBuilderError extends Error {
    constructor(
        public query: AnyQuery,
        public type: string,
        public message: string,
    ) {
        super(message);
        Error.captureStackTrace(this, QueryBuilderError);
    }

    static createNestedQueryMissingRefOpWhereClauseError({
        query,
        nestedQuery,
    }: {
        query: AnyQuery;
        nestedQuery: AnyQuery;
    }): QueryBuilderError {
        const type = 'NestedQueryMissingRefOpWhereClauseError';

        const lines = [
            `The table "${query.from}" is including table "${nestedQuery.from}",`,
            `but "${nestedQuery.from}" is missing a join predicate!`,
            '',
            `Hint: are you missing \`.filter({ some_id: col("${query.from}.some_id") })\``,
            `on the "${nestedQuery.from}" query?`,
            ``,
        ];

        return new QueryBuilderError(query, type, lines.join('\n'));
    }
}
