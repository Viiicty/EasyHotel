const API_BASE = 'http://localhost:8888';

async function testSubmission() {
  try {
    const testEmail = `test${Date.now()}@example.com`;

    console.log('=== Registering user ===');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123',
        name: '测试商户',
        role: 'merchant'
      })
    });

    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);

    console.log('\n=== Logging in ===');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginResponse.ok || !loginData.data || !loginData.data.access_token) {
      console.log('Login failed');
      return;
    }

    const token = loginData.data.access_token;
    const userId = loginData.data.user.id;

    console.log('\n=== Creating hotel ===');
    const hotelData = {
      nameZh: '测试酒店',
      nameEn: 'Test Hotel',
      cityCode: 'HZ',
      address: '杭州市西湖区',
      starLevel: 4,
      openedDate: '2020-01-01',
      lat: 30.25,
      lng: 120.15,
      status: 'PENDING'
    };

    const hotelResponse = await fetch(`${API_BASE}/hotel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(hotelData)
    });

    const hotelResult = await hotelResponse.json();
    console.log('Hotel response:', hotelResult);

    if (!hotelResponse.ok || hotelResult.code !== 200) {
      console.log('Hotel creation failed');
      return;
    }

    const hotelId = hotelResult.data.id;

    console.log('\n=== Creating submission ===');
    const submissionData = {
      hotelId: hotelId,
      merchantId: userId,
      payloadJson: JSON.stringify({
        type: '酒店信息',
        hotel: hotelData
      }),
      status: 'PENDING'
    };

    console.log('Submission data:', submissionData);

    const submissionResponse = await fetch(`${API_BASE}/hotel-submission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(submissionData)
    });

    const submissionResult = await submissionResponse.json();
    console.log('\nSubmission response status:', submissionResponse.status);
    console.log('Submission response:', submissionResult);

    if (submissionResponse.ok) {
      console.log('\n✓ Submission created successfully!');

      console.log('\n=== Getting submissions ===');
      const getSubmissionsResponse = await fetch(`${API_BASE}/hotel-submission`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const submissionsResult = await getSubmissionsResponse.json();
      console.log('Submissions:', submissionsResult);
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSubmission();
