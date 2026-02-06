const API_BASE = 'http://localhost:8888';

async function testSubmission() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxNzcwMjgxMjY5MzExQGV4YW1wbGUuY29tIiwic3ViIjoiNGJlMjE3YjQtZGI2Ni00YmFkLWJjODAtOGFhNGQ4ZTdkYmE2IiwiaWF0IjoxNzcwMjgxMjY5LCJleHAiOjE3NzAyODQ4Njl9.test';

    const submissionData = {
      hotelId: 'e788e3a1-e2e5-4b0f-b80b-cefb4a080f8f',
      merchantId: '4be217b4-db66-4bad-bc80-8aa4d8e7dba6',
      payloadJson: JSON.stringify({
        type: '酒店信息',
        hotel: {
          nameZh: '测试酒店',
          nameEn: 'Test Hotel'
        }
      }),
      status: 'PENDING'
    };

    console.log('Creating submission...');
    console.log('Data:', submissionData);

    const response = await fetch(`${API_BASE}/hotel-submission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(submissionData)
    });

    const result = await response.json();
    console.log('\nResponse status:', response.status);
    console.log('Response:', result);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSubmission();
