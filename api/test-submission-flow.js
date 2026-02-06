const API_BASE = 'http://localhost:8888';

async function testSubmissionFlow() {
  console.log('=== 测试提交记录流程 ===\n');

  try {
    let token;
    const testEmail = `test${Date.now()}@example.com`;

    console.log('=== 注册新用户 ===');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123',
        name: '测试商户',
        role: 'merchant'
      })
    });

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      console.log('注册失败:', registerData);
      return;
    }

    console.log('注册成功！');
    console.log('用户ID:', registerData.id);
    console.log('用户邮箱:', registerData.email);
    console.log();

    console.log('=== 登录 ===');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok || !loginData.data || !loginData.data.access_token) {
      console.log('登录失败:', loginData);
      return;
    }

    token = loginData.data.access_token;
    console.log('登录成功！');
    console.log('用户信息:', loginData.data.user);
    console.log();

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

    console.log('=== 提交酒店信息 ===');
    const hotelResponse = await fetch(`${API_BASE}/hotel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(hotelData)
    });

    const hotelDataResponse = await hotelResponse.json();

    if (hotelDataResponse.code !== 200) {
      console.log('酒店提交失败:', hotelDataResponse);
      return;
    }

    console.log('酒店提交成功！');
    console.log('酒店ID:', hotelDataResponse.data.id);
    console.log('酒店名称:', hotelDataResponse.data.nameZh);
    console.log();

    const hotelId = hotelDataResponse.data.id;

    const submissionData = {
      hotelId: hotelId,
      payloadJson: JSON.stringify({
        type: '酒店信息',
        hotel: hotelData
      }),
      status: 'PENDING'
    };

    console.log('=== 创建提交记录 ===');
    const submissionResponse = await fetch(`${API_BASE}/hotel-submission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(submissionData)
    });

    const submissionDataResponse = await submissionResponse.json();

    if (submissionDataResponse.code !== 200) {
      console.log('提交记录创建失败:', submissionDataResponse);
      return;
    }

    console.log('提交记录创建成功！');
    console.log('提交记录ID:', submissionDataResponse.data.id);
    console.log();

    console.log('=== 获取提交记录列表 ===');
    const submissionsResponse = await fetch(`${API_BASE}/hotel-submission`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const submissionsData = await submissionsResponse.json();

    if (submissionsData.code !== 200) {
      console.log('获取提交记录失败:', submissionsData);
      return;
    }

    console.log('提交记录列表:');
    submissionsData.data.forEach((submission, index) => {
      console.log(`  ${index + 1}. ID: ${submission.id}`);
      console.log(`     酒店ID: ${submission.hotelId}`);
      console.log(`     状态: ${submission.status}`);
      console.log(`     创建时间: ${submission.createdAt}`);
      console.log();
    });

    console.log('✓ 测试完成！');

  } catch (error) {
    console.error('✗ 错误:', error.message);
  }
}

testSubmissionFlow();
