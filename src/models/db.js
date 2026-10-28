import { Pool } from 'pg';

if (!process.env.DB_URL) {
    throw new Error('DB_URL is required. Configure .env locally or the Render environment.');
}

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' },
    connectionTimeoutMillis: 10000
});

// Handle errors on idle clients as well as errors from individual queries.
pool.on('error', (error) => {
    console.error('Unexpected database pool error:', error.code || 'UNKNOWN');
});

const loggingEnabled = process.env.ENABLE_SQL_LOGGING === 'true';
const db = {
    async query(text, params) {
        const start = Date.now();
        try {
            const result = await pool.query(text, params);
            if (loggingEnabled) {
                console.log('Executed query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    duration: `${Date.now() - start}ms`,
                    rows: result.rowCount
                });
            }
            return result;
        } catch (error) {
            // Do not log connection strings, passwords or parameter values.
            console.error('Database query failed:', error.code || 'UNKNOWN');
            throw error;
        }
    },
    async close() {
        await pool.end();
    }
};

const testConnection = async () => {
    const result = await db.query('SELECT NOW() AS current_time');
    console.log('Database connection successful:', result.rows[0].current_time);
    return true;
};

export { db as default, testConnection };
