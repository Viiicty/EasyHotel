export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/hotel/list',
    'pages/hotel/detail',
    'pages/book/book',
    'pages/user/profile',
    'pages/order/detail',
    'pages/login/login',
    'pages/register/register'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1890ff',
    navigationBarTitleText: 'EasyHotel',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: false
  },
  requiredPrivateInfos: [
    'getLocation'
  ],
  permission: {
    'scope.userLocation': {
      desc: '您的位置信息将用于为您推荐附近的酒店'
    }
  },
  // tabBar: {
  //   color: '#999999',
  //   selectedColor: '#1890ff',
  //   backgroundColor: '#ffffff',
  //   borderStyle: 'white',
  //   list: [
  //     {
  //   pagePath: 'pages/index/index',
  //   text: '首页',
  //   iconPath: 'assets/icons/home.png',
  //   selectedIconPath: 'assets/icons/home-active.png'
  // },
  //     {
  //   pagePath: 'pages/hotel/list',
  //   text: '酒店',
  //   iconPath: 'assets/icons/hotel.png',
  //   selectedIconPath: 'assets/icons/hotel-active.png'
  // },
  //     {
  //   pagePath: 'pages/order/list',
  //   text: '订单',
  //   iconPath: 'assets/icons/order.png',
  //   selectedIconPath: 'assets/icons/order-active.png'
  // },
  //     {
  //   pagePath: 'pages/user/profile',
  //   text: '我的',
  //   iconPath: 'assets/icons/user.png',
  //   selectedIconPath: 'assets/icons/user-active.png'
  // }
  // ]
  // }
})
