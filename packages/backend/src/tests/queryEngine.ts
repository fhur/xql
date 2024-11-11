import { config } from 'dotenv';
import { Pool } from 'pg';
import { QueryEngine } from '../QueryEngine';
import { Middleware } from '../execution/middleware';
import { DB } from './generated';

config();

export const pool = new Pool({
    connectionString:
        process.env.DATABASE_URL ??
        'postgres://postgres:postgres@localhost:5432/postgres',
});

export function createQueryEngine(data?: {
    schema?: string;
    middlewares?: Array<Middleware<any, any>>;
    dangerouslyIgnorePermissions?: boolean;
}) {
    return new QueryEngine<DB>({
        pool,
        schema: data?.schema ?? 'public',
        middlewares: data?.middlewares,
        dangerouslyIgnorePermissions:
            data?.dangerouslyIgnorePermissions ?? true,
    });
}
