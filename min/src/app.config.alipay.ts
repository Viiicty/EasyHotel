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
  location: {
    type: 'wgs84'
  },
  permission: {
    'scope.userLocation': {
      desc: '您的位置信息将用于为您推荐附近的酒店'
    }
  }
})
