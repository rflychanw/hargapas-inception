// src/lib/server/db.ts
import postgres from 'postgres';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$app/env/private';

const connectionString = DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/hargapas';

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.NETLIFY;
const isNeon = connectionString.includes('neon.tech');

function camelize(str: string) {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function mapRowsToCamel<T = any>(rows: any[]): T {
	if (!Array.isArray(rows)) return rows as T;
	const mapped = rows.map((row) => {
		if (typeof row !== 'object' || row === null) return row;
		const newObj: Record<string, any> = {};
		for (const key of Object.keys(row)) {
			newObj[camelize(key)] = row[key];
		}
		return newObj;
	});

	Object.defineProperty(mapped, 'count', {
		value: rows.length,
		writable: true,
		enumerable: false
	});

	return mapped as T;
}

// Client Postgres Standard (TCP Native)
const standardSql = postgres(connectionString, {
	max: isProduction ? 1 : 10,
	idle_timeout: isProduction ? 1 : 20,
	connect_timeout: 2,
	transform: {
		...postgres.toCamel
	}
});

// Client Neon Cloud (HTTP)
const neonSql = isNeon ? neon(connectionString) : null;

export type SqlQueryResult<T = any> = T & { count: number };

export interface CustomSql {
	<T = any[]>(strings: TemplateStringsArray, ...values: any[]): Promise<SqlQueryResult<T>>;
	begin<T>(cb: (tx: any) => Promise<T>): Promise<T>;
}

// Jika menggunakan Neon, gunakan fungsi wrapper. Jika Postgres lokal/standard, gunakan standardSql secara native!
export const sql: any = isNeon
	? (async function <T = any[]>(
			strings: TemplateStringsArray,
			...values: any[]
		): Promise<SqlQueryResult<T>> {
			const rows = await neonSql!(strings, ...values);
			return mapRowsToCamel<SqlQueryResult<T>>(rows);
		} as CustomSql)
	: standardSql;

if (isNeon) {
	sql.begin = async function <T>(cb: (tx: any) => Promise<T>): Promise<T> {
		return await cb(sql);
	};
}

let pgAvailableCache: { ok: boolean; checkedAt: number } | null = null;
const PG_CACHE_TTL_MS = 15_000;

export async function checkDbConnection(): Promise<{ ok: boolean; message?: string }> {
	const now = Date.now();
	if (pgAvailableCache && now - pgAvailableCache.checkedAt < PG_CACHE_TTL_MS) {
		return { ok: pgAvailableCache.ok };
	}
	try {
		await sql`SELECT 1 FROM stores LIMIT 1`;
		pgAvailableCache = { ok: true, checkedAt: now };
		return { ok: true };
	} catch (err: any) {
		pgAvailableCache = { ok: false, checkedAt: now };
		return { ok: false, message: err?.message || 'Database connection error' };
	}
}

export async function isPostgresAvailable(): Promise<boolean> {
	const res = await checkDbConnection();
	return res.ok;
}

export default sql;

