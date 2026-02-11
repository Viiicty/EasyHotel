const BASE_URL = 'http://localhost:8888';

async function testMiniHotelAPI() {
  console.log('=== 测试小程序酒店API ===\n');

  try {
    console.log('1. 测试获取城市酒店列表 (shanghai)...');
    const listResponse = await fetch(`${BASE_URL}/mini/hotel/list?cityCode=shanghai`);
    const hotels = await listResponse.json();
    console.log('状态码:', listResponse.status);
    console.log('酒店列表:', JSON.stringify(hotels, null, 2));
    console.log(`找到 ${hotels.length} 家酒店\n`);

    if (hotels.length > 0) {
      const hotelId = hotels[0].id;
      console.log(`2. 测试获取酒店详情 (ID: ${hotelId})...`);
      const detailResponse = await fetch(`${BASE_URL}/mini/hotel/${hotelId}`);
      const hotelDetail = await detailResponse.json();
      console.log('状态码:', detailResponse.status);
      console.log('酒店详情:', JSON.stringify(hotelDetail, null, 2));
    } else {
      console.log('没有找到酒店，跳过详情测试');
    }

    console.log('\n=== 测试完成 ===');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testMiniHotelAPI();
