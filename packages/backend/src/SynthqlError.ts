import { AnyQuery } from '@synthql/queries';
import { DatabaseError } from 'pg';
import { format } from 'sql-formatter';

interface SqlExecutionErrorProps {
    query: AnyQuery;
    sql: string;
    params: readonly any[];
}

export class SynthqlError extends Error {
    constructor(
        public err: Error | any,
        public type: string,
        public message: string,
        public code: number = 500,
    ) {
        super(message);
        Error.captureStackTrace(this, SynthqlError);
    }

    static createDatabaseConnectionError({
        error,
    }: {
        error: any;
    }): SynthqlError {
        const type = 'DatabaseConnectionError';

        const lines = [
            'Database connection error!',
            '',
            'Failure to establish a connection to your database.',
            '',
            'Check your connection string, and make sure your database',
            'is up and can accept new connections.',
            '',
            'Here is the underlying error message:',
            '',
            error,
        ];

        return new SynthqlError(error, type, lines.join('\n'));
    }
    static createSqlExecutionError({
        error,
        props,
    }: {
        error: any;
        props: SqlExecutionErrorProps;
    }): SynthqlError {
        const type = 'SqlExecutionError';

        const message = composeMessage(error, props);

        return new SynthqlError(error, type, message);
    }

    static createPrependSqlExecutionError({
        error,
        prependSql,
    }: {
        error: any;
        prependSql: string;
    }): SynthqlError {
        const type = 'PrependSqlExecutionError';

        const lines: string[] = [
            '# Error executing prepended SQL query',
            '',
            printError(error),
            '',
            'This error was caused by the following prepended SQL query:',
            tryFormatSql(prependSql),
        ];

        return new SynthqlError(error, type, lines.join('\n'));
    }

    static createResponseStreamingError({
        error,
        query,
    }: {
        error: any;
        query: AnyQuery;
    }): SynthqlError {
        const type = 'ResponseStreamingError';

        const lines = [
            'Response streaming error!',
            '',
            'Failure while streaming back the results for the query:',
            '',
            JSON.stringify(query, null, 2),
            '',
            'Check your query and make sure you have`read` access to all included',
            'tables and columns, and have registered all queries via the QueryEngine',
        ];

        return new SynthqlError(error, type, lines.join('\n'));
    }

    static createJsonParsingError({
        error,
        json,
    }: {
        error: any;
        json: string;
    }): SynthqlError {
        const type = 'JsonParsingError';

        const lines = [
            'JSON parsing error!',
            '',
            'Expected a JSON string but got this instead:',
            '',
            json,
            '',
            'Check your query and make sure your stringifying function is behaving as expected',
        ];

        return new SynthqlError(error, type, lines.join('\n'));
    }

    static createCardinalityError() {
        const type = 'CardinalityError';

        // Two ways this error can happen:
        // 1. The top level query returned no results.
        // 2. A subquery returned no results.

        const lines = [
            'A query with a cardinality of `one` returned no results!',
            'Hint: are you using .firstOrThrow() when you should be using .first()?',
        ];

        return new SynthqlError(new Error(), type, lines.join('\n'), 404);
    }

    static createPermissionsError({
        query,
        missingPermissions,
        contextPermissions,
    }: {
        query: AnyQuery;
        missingPermissions: string[];
        contextPermissions: string[];
    }) {
        const type = 'PermissionsError';

        const lines = [
            `The query ${query?.name} is missing the following permissions: ${missingPermissions.join(', ')}`,
            '',
            'in the passed context permissions list:',
            `${JSON.stringify(contextPermissions, null, 2)}`,
            '',
            'from its list of required permissions defined:',
            `${JSON.stringify(query?.permissions, null, 2)}`,
            '',
        ];

        return new SynthqlError(new Error(), type, lines.join('\n'), 403);
    }
}

function printError(err: any): string {
    if (err instanceof DatabaseError) {
        return [err.message, err.stack].join('\n');
    } else if (err instanceof Error) {
        return [err.message, err.stack].join('\n');
    }

    return String(err);
}

function composeMessage(err: any, props: SqlExecutionErrorProps): string {
    const lines: string[] = [
        '# Error executing query',
        '',
        printError(err),
        '',
        'This error was caused by the following SQL query:',
        tryFormatSql(props.sql),
        '',
        'With the following parameters:',
        JSON.stringify(props.params, null, 2),
        '',
        'And which was composed from the following SynthQL query:',
        JSON.stringify(props.query, null, 2),
        '',
    ];

    return lines.join('\n');
}

function tryFormatSql(sql: string): string {
    try {
        return format(sql, { language: 'postgresql' });
    } catch (err) {
        return sql;
    }
}
