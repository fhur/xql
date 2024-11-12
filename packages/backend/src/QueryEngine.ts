import { Pool } from 'pg';
import { Query, QueryResult, Table } from '@synthql/queries';
import { QueryPlan, collectLast } from '.';
import { QueryExecutor } from './execution/types';
import { QueryProvider } from './QueryProvider';
import { execute } from './execution/execute';
import { Middleware, permissionsMiddleware } from './execution/middleware';
import { PgExecutor } from './execution/executors/PgExecutor';
import { QueryProviderExecutor } from './execution/executors/QueryProviderExecutor';
import { composeQuery } from './execution/executors/PgExecutor/composeQuery';
import { generateLast } from './util/generators/generateLast';
import { SynthqlError } from './SynthqlError';

export interface QueryEngineProps<DB> {
    /**
     * The database connection string.
     *
     * e.g. `postgresql://user:password@localhost:5432/db`
     *
     * If you use this option, SynthQL will create
     * a conection pool for you internally.
     */
    url?: string;
    /**
     * The name of the database schema to
     * execute your SynthQL queries against.
     *
     * e.g. `public`
     */
    schema?: string;
    /**
     * An optional SQL statement that will
     * be sent before every SynthQL query.
     *
     * e.g.:
     *
     * ```sql
     * SELECT version();
     * ```
     */
    prependSql?: string;
    /**
     * If true, the executor will execute queries that don't
     * have the listed permissions in `query.permissions`
     * passed via the query context permissions list.
     */
    dangerouslyIgnorePermissions?: boolean;
    /**
     * A list of middlewares that you want to be used to
     * transform any matching queries, before execution.
     *
     * e.g.:
     *
     * ```ts
     * // Create type/interface for context
     * type UserRole = 'user' | 'admin' | 'super';
     *
     * interface Session {
     *     id: number;
     *     email: string;
     *     roles: UserRole[];
     *     isActive: boolean;
     * };
     *
     * // Create middleware
     * const restrictPaymentsByCustomer =
     *  middleware<Query<DB, 'payment'>, Session>({
     *     predicate: ({ query, context }) =>
     *         query.from === 'payment' &&
     *         context.roles.includes('user') &&
     *         context.isActive,
     *     transformQuery: ({ query, context }) => ({
     *         ...query,
     *         where: {
     *             ...query.where,
     *             customer_id: context.id,
     *         },
     *     }),
     * });
     * ```
     */
    middlewares?: Array<Middleware<any, any>>;
    /**
     * A list of providers that you want to be used
     * to execute your SynthQL queries against.
     *
     * e.g.:
     *
     * ```ts
     *      const films = [{
     *          film_id: 1
     *      }, {
     *          film_id: 2
     *      }];
     *
     *      const filmIds = [1, 2, 3];
     *
     *      const filmProvider = {
     *          table: 'film',
     *          execute: async ({ film_id: filmIds }):
     *              Promise<{ film_id: number }[]> => {
     *              return films.filter((f) =>
     *                  filmIds.includes(f.film_id));
     *          },
     *      };
     * ```
     */
    providers?: Array<QueryProvider<DB, Table<DB>>>;
    /**
     * The connection pool to which the
     * executor will send SQL queries to.
     *
     * You can use this instead of
     * passing a connection string.
     */
    pool?: Pool;

    /**
     * Whether to log SQL statements or not.
     */
    logging?: boolean;
}

export class QueryEngine<DB> {
    private pool: Pool;
    private schema: string;
    private prependSql?: string;
    private middlewares: Array<Middleware<any, any>>;
    private executors: Array<QueryExecutor>;

    constructor(config: QueryEngineProps<DB>) {
        this.schema = config.schema ?? 'public';
        this.prependSql = config.prependSql;
        this.pool =
            config.pool ??
            new Pool({
                connectionString: config.url,
                max: 10,
            });
        this.middlewares = config.dangerouslyIgnorePermissions
            ? config.middlewares ?? []
            : [...(config.middlewares ?? []), permissionsMiddleware];

        const qpe = new QueryProviderExecutor(config.providers ?? []);
        this.executors = [
            qpe,
            new PgExecutor({
                pool: this.pool,
                defaultSchema: this.schema,
                qpe,
                prependSql: this.prependSql,
                logging: config.logging,
            }),
        ];
    }

    execute<
        TTable extends Table<DB>,
        TQuery extends Query<DB, TTable>,
        TContext,
    >(
        query: TQuery,
        opts?: {
            context?: TContext;
            /**
             * The name of the database schema to
             * execute your SynthQL query against
             *
             * e.g. `public`
             */
            schema?: string;
            /**
             * If true, the query result generator will wait for query
             * execution completion, and then return only the last result
             */
            returnLastOnly?: boolean;
        },
    ): AsyncGenerator<QueryResult<DB, TQuery>> {
        let transformedQuery: any = query;

        for (const middleware of this.middlewares) {
            if (
                middleware.predicate({
                    query,
                    context: opts?.context ?? {},
                })
            ) {
                transformedQuery = middleware.transformQuery({
                    query: transformedQuery,
                    context: opts?.context ?? {},
                });
            }
        }

        const gen = execute<DB, TQuery>(transformedQuery as TQuery, {
            executors: this.executors,
            defaultSchema: opts?.schema ?? this.schema,
            prependSql: this.prependSql,
        });

        if (opts?.returnLastOnly) {
            return generateLast(gen);
        }

        return gen;
    }

    async executeAndWait<
        TTable extends Table<DB>,
        TQuery extends Query<DB, TTable>,
        TContext,
    >(
        query: TQuery,
        opts?: {
            /**
             * When using `.permissions()` (in your query) and/or `middlewares`
             * (via the `QueryEngine` options), use this option to pass the
             * data that should be used to transform and/or check the query
             *
             * e.g.:
             *
             * ```ts
             * // Create type/interface for context
             * type UserRole = 'user' | 'admin' | 'super';
             *
             * interface Session {
             *     id: number;
             *     email: string;
             *     roles: UserRole[];
             *     isActive: boolean;
             * };
             *
             * // Create context
             * // This would usually be an object generated from a server
             * // request handler (e.g a parsed cookie/token)
             * const context: Session = {
             *     id: 1,
             *     email: 'user@example.com',
             *     roles: ['user', 'admin', 'super'],
             *     isActive: true,
             * };
             * ```
             */
            context?: TContext;
            /**
             * The name of the database schema to
             * execute your SynthQL query against
             *
             * e.g. `public`
             */
            schema?: string;
        },
    ): Promise<QueryResult<DB, TQuery>> {
        return collectLast(
            this.execute(query, {
                context: opts?.context,
                schema: opts?.schema ?? this.schema,
                returnLastOnly: true,
            }),
        );
    }

    compile<T>(query: T extends Query<DB> ? T : never): {
        sql: string;
        params: any[];
    } {
        const { sqlBuilder } = composeQuery({
            defaultSchema: this.schema,
            query,
        });

        return sqlBuilder.build();
    }

    async explain<TTable extends Table<DB>>(
        query: Query<DB, TTable>,
    ): Promise<QueryPlan> {
        const { sqlBuilder } = composeQuery({
            defaultSchema: this.schema,
            query,
        });

        const { params, sql } = sqlBuilder.build();

        const explainQuery: string = `explain (analyze, buffers, verbose, settings, format json) ${sql}`;

        try {
            const result = await this.pool.query(explainQuery, params);
            return result.rows[0]['QUERY PLAN'][0];
        } catch (err) {
            throw SynthqlError.createSqlExecutionError({
                error: err,
                props: { params, sql, query },
            });
        }
    }
}
