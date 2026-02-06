const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'easy_hotel',
  user: 'postgres',
  password: '123456',
});

async function testInsert() {
  try {
    await client.connect();
    console.log('Connected to database');

    const hotelId = '6c5b0b07-90d8-41c1-aed5-0467ba44d86d';
    const merchantId = '3048e5c0-be3b-4731-89bb-1a5371905853';

    const insertQuery = `
      INSERT INTO hotel_submission ("hotel_id", "merchant_id", "payloadJson", "status", "createdBy")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, "hotel_id", "merchant_id", status, "createdTime"
    `;

    const payloadJson = JSON.stringify({
      type: '酒店信息',
      hotel: {
        nameZh: '测试酒店',
        nameEn: 'Test Hotel'
      }
    });

    const values = [hotelId, merchantId, payloadJson, 'PENDING', merchantId];

    console.log('Executing query...');
    console.log('Values:', values);

    const result = await client.query(insertQuery, values);

    console.log('\n=== Insert successful ===');
    console.log('Inserted record:', result.rows[0]);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.end();
  }
}

testInsert();
