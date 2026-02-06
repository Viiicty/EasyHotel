const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'easy_hotel',
  user: 'postgres',
  password: '123456',
});

async function checkSchema() {
  try {
    await client.connect();
    console.log('Connected to database');

    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'hotel_submission'
      ORDER BY ordinal_position;
    `);

    console.log('\n=== hotel_submission table schema ===');
    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();
