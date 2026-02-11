const BASE_URL = 'http://localhost:8888';

async function testBannerHotelAPI() {
  console.log('=== 测试点击Banner获取酒店详情API ===\n');

  try {
    console.log('1. 获取Banner列表...');
    const bannerResponse = await fetch(`${BASE_URL}/home-banner`);
    const bannerData = await bannerResponse.json();
    console.log('状态码:', bannerResponse.status);
    console.log('Banner数量:', bannerData.data?.length || 0);

    if (!bannerData.data || bannerData.data.length === 0) {
      console.log('没有找到Banner，测试结束');
      return;
    }

    console.log('\nBanner列表:');
    bannerData.data.forEach((banner, index) => {
      console.log(`${index + 1}. ID: ${banner.id}, 图片: ${banner.coverImage || '无'}, 关联酒店: ${banner.hotel?.nameZh || '无'}`);
    });

    const firstBanner = bannerData.data[0];
    console.log(`\n2. 测试获取第一个Banner的详情 (ID: ${firstBanner.id})...`);
    const bannerDetailResponse = await fetch(`${BASE_URL}/home-banner/${firstBanner.id}`);
    const bannerDetail = await bannerDetailResponse.json();
    console.log('状态码:', bannerDetailResponse.status);
    console.log('Banner详情:', JSON.stringify(bannerDetail.data, null, 2));

    if (bannerDetail.data && bannerDetail.data.hotel) {
      const hotelId = bannerDetail.data.hotel.id;
      console.log(`\n3. 根据Banner关联的酒店ID获取酒店详情 (ID: ${hotelId})...`);
      const hotelDetailResponse = await fetch(`${BASE_URL}/mini/hotel/${hotelId}`);
      const hotelDetail = await hotelDetailResponse.json();
      console.log('状态码:', hotelDetailResponse.status);
      console.log('酒店详情:', JSON.stringify(hotelDetail.data, null, 2));

      console.log('\n4. 测试获取该城市的酒店列表...');
      const cityCode = bannerDetail.data.cityCode;
      const cityHotelsResponse = await fetch(`${BASE_URL}/mini/hotel/list?cityCode=${cityCode}`);
      const cityHotels = await cityHotelsResponse.json();
      console.log('状态码:', cityHotelsResponse.status);
      console.log(`城市 ${cityCode} 的酒店数量:`, cityHotels.data?.length || 0);
    } else {
      console.log('\n该Banner没有关联酒店');
    }

    if (bannerData.data.length > 1) {
      const secondBanner = bannerData.data[1];
      console.log(`\n5. 测试获取第二个Banner的详情 (ID: ${secondBanner.id})...`);
      const secondBannerDetailResponse = await fetch(`${BASE_URL}/home-banner/${secondBanner.id}`);
      const secondBannerDetail = await secondBannerDetailResponse.json();
      console.log('状态码:', secondBannerDetailResponse.status);
      console.log('关联酒店:', secondBannerDetail.data?.hotel?.nameZh || '无');
    }

    console.log('\n=== 测试完成 ===');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testBannerHotelAPI();
