const BASE_URL = 'http://localhost:8888';

async function testStarLevelAPI() {
  console.log('=== 测试按星级查询酒店API ===\n');

  try {
    console.log('1. 测试查询3星及以下的酒店...');
    const response3 = await fetch(`${BASE_URL}/mini/hotel/by-star-level?starLevel=3`);
    const data3 = await response3.json();
    console.log('状态码:', response3.status);
    console.log('3星及以下酒店数量:', data3.data?.length || 0);
    if (data3.data && data3.data.length > 0) {
      console.log('酒店列表:', data3.data.map(h => `${h.hotelName} - ${h.starLevel}星`).join('\n'));
    }
    console.log();

    console.log('2. 测试查询4星及以下的酒店...');
    const response4 = await fetch(`${BASE_URL}/mini/hotel/by-star-level?starLevel=4`);
    const data4 = await response4.json();
    console.log('状态码:', response4.status);
    console.log('4星及以下酒店数量:', data4.data?.length || 0);
    if (data4.data && data4.data.length > 0) {
      console.log('酒店列表:', data4.data.map(h => `${h.hotelName} - ${h.starLevel}星`).join('\n'));
    }
    console.log();

    console.log('3. 测试查询5星及以下的酒店...');
    const response5 = await fetch(`${BASE_URL}/mini/hotel/by-star-level?starLevel=5`);
    const data5 = await response5.json();
    console.log('状态码:', response5.status);
    console.log('5星及以下酒店数量:', data5.data?.length || 0);
    if (data5.data && data5.data.length > 0) {
      console.log('酒店列表:', data5.data.map(h => `${h.hotelName} - ${h.starLevel}星`).join('\n'));
    }

    console.log('\n=== 测试完成 ===');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testStarLevelAPI();
