import postgres from 'postgres';
import fs from 'node:fs';
import path from 'node:path';

// Helper to load .env manually if not already populated in process.env
function loadEnv() {
	const envPath = path.resolve(process.cwd(), '.env');
	if (fs.existsSync(envPath)) {
		const envContent = fs.readFileSync(envPath, 'utf-8');
		for (const line of envContent.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const eqIdx = trimmed.indexOf('=');
			if (eqIdx !== -1) {
				const key = trimmed.slice(0, eqIdx).trim();
				const value = trimmed
					.slice(eqIdx + 1)
					.trim()
					.replace(/(^['"]|['"]$)/g, '');
				if (!process.env[key]) {
					process.env[key] = value;
				}
			}
		}
	}
}

loadEnv();

const connectionString =
	process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/hargapas';

console.log('🔄 Connecting to PostgreSQL:', connectionString.replace(/:[^:@]+@/, ':****@'));

const sql = postgres(connectionString, {
	max: 1,
	connect_timeout: 10,
	onnotice: () => {} // suppress notices
});

async function runMigration() {
	try {
		console.log('🚀 Running Schema Migration...');
		const schemaPath = path.resolve(process.cwd(), 'scripts/schema.sql');

		if (!fs.existsSync(schemaPath)) {
			throw new Error(`Schema file not found at: ${schemaPath}`);
		}

		await sql.file(schemaPath);
		console.log('✅ Schema migration applied successfully.');

		const shouldSeed = process.argv.includes('--seed');
		if (shouldSeed) {
			console.log('🌱 Seeding database with culinary sample data...');
			const seedPath = path.resolve(process.cwd(), 'scripts/seed.sql');

			if (!fs.existsSync(seedPath)) {
				throw new Error(`Seed file not found at: ${seedPath}`);
			}

			await sql.file(seedPath);
			console.log('✅ Sample data seeded successfully.');
		}

		console.log('🎉 Database setup complete!');
		process.exit(0);
	} catch (error: any) {
		console.error('\n❌ Migration failed:');
		if (error?.code === '28P01') {
			console.error('👉 Authentication error: Invalid username or password in DATABASE_URL.');
			console.error(
				'   Please check your credentials in .env (e.g. DATABASE_URL=postgres://user:password@localhost:5432/dbname)'
			);
		} else if (error?.code === '3D000') {
			console.error(
				'👉 Database does not exist: Please create the database first (e.g. createdb hargapas).'
			);
		} else if (error?.code === 'ECONNREFUSED') {
			console.error(
				'👉 Connection refused: PostgreSQL server is not running on the specified host/port.'
			);
		} else {
			console.error(error?.message || error);
		}
		process.exit(1);
	} finally {
		await sql.end({ timeout: 5 });
	}
}

runMigration();

