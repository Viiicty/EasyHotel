const BASE_URL = 'http://localhost:8888';

async function testSearchAPI() {
  console.log('=== 测试酒店搜索API ===\n');

  try {
    console.log('1. 测试按城市搜索 (shanghai)...');
    const response1 = await fetch(`${BASE_URL}/mini/hotel/search?cityCode=shanghai`);
    const data1 = await response1.json();
    console.log('状态码:', response1.status);
    console.log('找到酒店数量:', data1.data?.length || 0);
    if (data1.data && data1.data.length > 0) {
      console.log('酒店列表:', data1.data.map(h => `${h.hotelName} - ${h.starLevel}星`).join('\n'));
    }
    console.log();

    console.log('2. 测试按城市和星级搜索 (shanghai, 3星)...');
    const response2 = await fetch(`${BASE_URL}/mini/hotel/search?cityCode=shanghai&starLevel=3`);
    const data2 = await response2.json();
    console.log('状态码:', response2.status);
    console.log('找到酒店数量:', data2.data?.length || 0);
    if (data2.data && data2.data.length > 0) {
      console.log('酒店列表:', data2.data.map(h => `${h.hotelName} - ${h.starLevel}星`).join('\n'));
    }
    console.log();

    console.log('3. 测试按城市和星级搜索 (shanghai, 4星)...');
    const response3 = await fetch(`${BASE_URL}/mini/hotel/search?cityCode=shanghai&starLevel=4`);
    const data3 = await response3.json();
    console.log('状态码:', response3.status);
    console.log('找到酒店数量:', data3.data?.length || 0);
    if (data3.data && data3.data.length > 0) {
      console.log('酒店列表:', data3.data.map(h => `${h.hotelName} - ${h.starLevel}星`).join('\n'));
    }
    console.log();

    console.log('4. 测试按城市和星级搜索 (shanghai, 5星)...');
    const response4 = await fetch(`${BASE_URL}/mini/hotel/search?cityCode=shanghai&starLevel=5`);
    const data4 = await response4.json();
    console.log('状态码:', response4.status);
    console.log('找到酒店数量:', data4.data?.length || 0);
    if (data4.data && data4.data.length > 0) {
      console.log('酒店列表:', data4.data.map(h => `${h.hotelName} - ${h.starLevel}星`).join('\n'));
    }
    console.log();

    console.log('5. 测试按城市和名称搜索 (shanghai, 左庭)...');
    const response5 = await fetch(`${BASE_URL}/mini/hotel/search?cityCode=shanghai&nameZh=左庭`);
    const data5 = await response5.json();
    console.log('状态码:', response5.status);
    console.log('找到酒店数量:', data5.data?.length || 0);
    if (data5.data && data5.data.length > 0) {
      console.log('酒店列表:', data5.data.map(h => `${h.hotelName} - ${h.starLevel}星`).join('\n'));
    }
    console.log();

    console.log('6. 测试按城市、名称和星级搜索 (shanghai, 左庭, 3星)...');
    const response6 = await fetch(`${BASE_URL}/mini/hotel/search?cityCode=shanghai&nameZh=左庭&starLevel=3`);
    const data6 = await response6.json();
    console.log('状态码:', response6.status);
    console.log('找到酒店数量:', data6.data?.length || 0);
    if (data6.data && data6.data.length > 0) {
      console.log('酒店列表:', data6.data.map(h => `${h.hotelName} - ${h.starLevel}星`).join('\n'));
    }

    console.log('\n=== 测试完成 ===');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testSearchAPI();
