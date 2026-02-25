import React, { Component } from 'react'
import { View, Text, Swiper, SwiperItem, Picker, Input, Image, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { hotelService, Banner, Hotel } from '../../services/hotel.service'
import { orderService } from '../../services/order.service'
import { userService } from '../../services/user.service'
import Calendar from '../../components/calendar/calendar'
import CitySelector from '../../components/city-selector/city-selector'
import PriceSelector from '../../components/price-selector/price-selector'
import StarSelector from '../../components/star-selector/star-selector'
import Skeleton from '../../components/skeleton/skeleton'
import './index.scss'

interface SearchParams {
  city: string
  hotelName: string
  checkIn: string
  checkOut: string
  minPrice: number
  maxPrice: number
  starLevel: number
  tags: string[]
}

interface StarLevel {
  label: string
  value: number
}

interface IndexState {
  bannerList: Banner[]
  searchParams: SearchParams
  displayCity: string
  starLevels: StarLevel[]
  availableTags: string[]
  recommendHotels: Hotel[]
  loading: boolean
  showCalendar: boolean
  calendarType: 'checkIn' | 'checkOut'
  pendingOrder: any
  remainingTime: number
  showPriceModal: boolean
  showStarModal: boolean
  showCityModal: boolean
  locating: boolean
  locationBubble: {
    visible: boolean
    city: string
    address: string
  }
  showEarlyMorningTip: boolean
  hotelNamePlaceholder: string
  isHotelNameFocused: boolean
  bookmarkPosition: { x: number; y: number }
  isDragging: boolean
}

export default class Index extends Component<{}, IndexState> {
  countdownTimer: any = null
  rafId: any = null

  getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  isEarlyMorning = () => {
    const now = new Date()
    const hour = now.getHours()
    return hour >= 0 && hour < 6
  }

  getCheckOutDate = () => {
    if (this.isEarlyMorning()) {
      return this.getTodayDate()
    } else {
      return this.getTomorrowDate()
    }
  }

  state = {
    bannerList: [],
    searchParams: {
      city: '',
      hotelName: '',
      checkIn: this.getTodayDate(),
      checkOut: this.getCheckOutDate(),
      minPrice: 0,
      maxPrice: 2000,
      starLevel: 0,
      tags: []
    },
    displayCity: '',
    hotelTags: [],
    availableTags: [],
    recommendHotels: [],
    loading: false,
    showCalendar: false,
    calendarType: 'checkIn',
    pendingOrder: null,
    remainingTime: 0,
    showPriceModal: false,
    showStarModal: false,
    showCityModal: false,
    locating: false,
    locationBubble: {
      visible: false,
      city: '',
      address: ''
    },
    showEarlyMorningTip: false,
    hotelNamePlaceholder: '请输入酒店名称',
    isHotelNameFocused: false,
    bookmarkPosition: { x: 300, y: 600 },
    isDragging: false
  }

  cityPinyinMap: { [key: string]: string } = {
    '北京': 'beijing',
    '上海': 'shanghai',
    '广州': 'guangzhou',
    '深圳': 'shenzhen',
    '成都': 'chengdu',
    '重庆': 'chongqing',
    '杭州': 'hangzhou',
    '武汉': 'wuhan',
    '西安': 'xian',
    '天津': 'tianjin',
    '苏州': 'suzhou',
    '南京': 'nanjing',
    '郑州': 'zhengzhou',
    '长沙': 'changsha',
    '东莞': 'dongguan',
    '沈阳': 'shenyang',
    '青岛': 'qingdao',
    '合肥': 'hefei',
    '佛山': 'foshan',
    '宁波': 'ningbo',
    '厦门': 'xiamen',
    '福州': 'fuzhou',
    '无锡': 'wuxi',
    '济南': 'jinan',
    '大连': 'dalian',
    '哈尔滨': 'haerbin',
    '长春': 'changchun',
    '昆明': 'kunming',
    '贵阳': 'guiyang',
    '南宁': 'nanning',
    '兰州': 'lanzhou',
    '西宁': 'xining',
    '银川': 'yinchuan',
    '乌鲁木齐': 'wulumuqi',
    '拉萨': 'lasa',
    '太原': 'taiyuan',
    '石家庄': 'shijiazhuang',
    '唐山': 'tangshan',
    '包头': 'baotou',
    '呼和浩特': 'huhehaote',
    '吉林': 'jilin',
    '齐齐哈尔': 'qiqihaer',
    '鸡西': 'jixi',
    '鹤岗': 'hegang',
    '双鸭山': 'shuangyashan',
    '大庆': 'daqing',
    '伊春': 'yichun',
    '佳木斯': 'jiamusi',
    '七台河': 'qitaihe',
    '牡丹江': 'mudanjiang',
    '黑河': 'heihe',
    '绥化': 'suihua',
    '徐州': 'xuzhou',
    '常州': 'changzhou',
    '南通': 'nantong',
    '连云港': 'lianyungang',
    '淮安': 'huaian',
    '盐城': 'yancheng',
    '扬州': 'yangzhou',
    '镇江': 'zhenjiang',
    '泰州': 'taizhou',
    '宿迁': 'suqian',
    '温州': 'wenzhou',
    '嘉兴': 'jiaxing',
    '湖州': 'huzhou',
    '绍兴': 'shaoxing',
    '金华': 'jinhua',
    '衢州': 'quzhou',
    '舟山': 'zhoushan',
    '台州': 'taizhou',
    '丽水': 'lishui',
    '芜湖': 'wuhu',
    '蚌埠': 'bengbu',
    '淮南': 'huainan',
    '马鞍山': 'maanshan',
    '淮北': 'huaibei',
    '铜陵': 'tongling',
    '安庆': 'anqing',
    '黄山': 'huangshan',
    '滁州': 'chuzhou',
    '阜阳': 'fuyang',
    '六安': 'luan',
    '亳州': 'bozhou',
    '池州': 'chizhou',
    '宣城': 'xuancheng',
    '莆田': 'putian',
    '三明': 'sanming',
    '泉州': 'quanzhou',
    '漳州': 'zhangzhou',
    '南平': 'nanping',
    '龙岩': 'longyan',
    '宁德': 'ningde',
    '南昌': 'nanchang',
    '景德镇': 'jingdezhen',
    '萍乡': 'pingxiang',
    '九江': 'jiujiang',
    '新余': 'xinyu',
    '鹰潭': 'yingtan',
    '赣州': 'ganzhou',
    '吉安': 'jian',
    '宜春': 'yichun',
    '抚州': 'fuzhou',
    '上饶': 'shangrao',
    '淄博': 'zibo',
    '枣庄': 'zaozhuang',
    '东营': 'dongying',
    '烟台': 'yantai',
    '潍坊': 'weifang',
    '济宁': 'jining',
    '泰安': 'taian',
    '威海': 'weihai',
    '日照': 'rizhao',
    '临沂': 'linyi',
    '德州': 'dezhou',
    '聊城': 'liaocheng',
    '滨州': 'binzhou',
    '菏泽': 'heze',
    '开封': 'kaifeng',
    '洛阳': 'luoyang',
    '平顶山': 'pingdingshan',
    '安阳': 'anyang',
    '新乡': 'xinxiang',
    '焦作': 'jiaozuo',
    '濮阳': 'puyang',
    '许昌': 'xuchang',
    '漯河': 'luohe',
    '三门峡': 'sanmenxia',
    '南阳': 'nanyang',
    '商丘': 'shangqiu',
    '信阳': 'xinyang',
    '周口': 'zhoukou',
    '驻马店': 'zhumadian',
    '黄石': 'huangshi',
    '十堰': 'shiyan',
    '宜昌': 'yichang',
    '襄阳': 'xiangyang',
    '鄂州': 'ezhou',
    '荆门': 'jingmen',
    '孝感': 'xiaogan',
    '荆州': 'jingzhou',
    '黄冈': 'huanggang',
    '咸宁': 'xianning',
    '随州': 'suizhou',
    '恩施': 'enshi',
    '株洲': 'zhuzhou',
    '湘潭': 'xiangtan',
    '衡阳': 'hengyang',
    '邵阳': 'shaoyang',
    '岳阳': 'yueyang',
    '常德': 'changde',
    '张家界': 'zhangjiajie',
    '益阳': 'yiyang',
    '郴州': 'chenzhou',
    '永州': 'yongzhou',
    '怀化': 'huaihua',
    '娄底': 'loudi',
    '湘西': 'xiangxi',
    '韶关': 'shaoguan',
    '珠海': 'zhuhai',
    '汕头': 'shantou',
    '江门': 'jiangmen',
    '湛江': 'zhanjiang',
    '茂名': 'maoming',
    '肇庆': 'zhaoqing',
    '惠州': 'huizhou',
    '梅州': 'meizhou',
    '汕尾': 'shanwei',
    '河源': 'heyuan',
    '阳江': 'yangjiang',
    '清远': 'qingyuan',
    '中山': 'zhongshan',
    '潮州': 'chaozhou',
    '揭阳': 'jieyang',
    '云浮': 'yunfu',
    '柳州': 'liuzhou',
    '梧州': 'wuzhou',
    '北海': 'beihai',
    '防城港': 'fangchenggang',
    '钦州': 'qinzhou',
    '贵港': 'guigang',
    '玉林': 'yulin',
    '百色': 'baise',
    '贺州': 'hezhou',
    '河池': 'hechi',
    '来宾': 'laibin',
    '崇左': 'chongzuo',
    '海口': 'haikou',
    '三亚': 'sanya',
    '三沙': 'sansha',
    '儋州': 'danzhou',
    '自贡': 'zigong',
    '攀枝花': 'panzhihua',
    '泸州': 'luzhou',
    '德阳': 'deyang',
    '绵阳': 'mianyang',
    '广元': 'guangyuan',
    '遂宁': 'suining',
    '内江': 'neijiang',
    '乐山': 'leshan',
    '南充': 'nanchong',
    '眉山': 'meishan',
    '宜宾': 'yibin',
    '广安': 'guangan',
    '达州': 'dazhou',
    '雅安': 'yaan',
    '巴中': 'bazhong',
    '资阳': 'ziyang',
    '阿坝': 'aba',
    '甘孜': 'ganzi',
    '凉山': 'liangshan',
    '六盘水': 'liupanshui',
    '遵义': 'zunyi',
    '安顺': 'anshun',
    '毕节': 'bijie',
    '铜仁': 'tongren',
    '黔西南': 'qianxinan',
    '黔东南': 'qiandongnan',
    '黔南': 'qiannan',
    '曲靖': 'qujing',
    '玉溪': 'yuxi',
    '保山': 'baoshan',
    '昭通': 'zhaotong',
    '普洱': 'puer',
    '临沧': 'lincang',
    '楚雄': 'chuxiong',
    '红河': 'honghe',
    '文山': 'wenshan',
    '西双版纳': 'xishuangbanna',
    '大理': 'dali',
    '德宏': 'dehong',
    '怒江': 'nujiang',
    '迪庆': 'diqing',
    '昌都': 'changdu',
    '山南': 'shannan',
    '日喀则': 'shigatse',
    '那曲': 'nagqu',
    '阿里': 'ali',
    '林芝': 'linzhi',
    '铜川': 'tongchuan',
    '宝鸡': 'baoji',
    '咸阳': 'xianyang',
    '渭南': 'weinan',
    '延安': 'yanan',
    '汉中': 'hanzhong',
    '榆林': 'yulin',
    '安康': 'ankang',
    '商洛': 'shangluo',
    '嘉峪关': 'jiayuguan',
    '金昌': 'jinchang',
    '白银': 'baiyin',
    '天水': 'tianshui',
    '武威': 'wuwei',
    '张掖': 'zhangye',
    '平凉': 'pingliang',
    '酒泉': 'jiuquan',
    '庆阳': 'qingyang',
    '定西': 'dingxi',
    '陇南': 'longnan',
    '临夏': 'linxia',
    '甘南': 'gannan',
    '海东': 'haidong',
    '海北': 'haibei',
    '黄南': 'huangnan',
    '海南': 'hainan',
    '果洛': 'guoluo',
    '玉树': 'yushu',
    '海西': 'haixi',
    '石嘴山': 'shizuishan',
    '吴忠': 'wuzhong',
    '固原': 'guyuan',
    '中卫': 'zhongwei',
    '克拉玛依': 'kelamayi',
    '吐鲁番': 'turpan',
    '哈密': 'hami',
    '昌吉': 'changji',
    '博尔塔拉': 'bortala',
    '巴音郭楞': 'bayingolin',
    '阿克苏': 'aksu',
    '克孜勒苏': 'kezilesu',
    '喀什': 'kashgar',
    '和田': 'hetian',
    '伊犁': 'ili',
    '塔城': 'tacheng',
    '阿勒泰': 'altay',
    '石河子': 'shihezi',
    '阿拉尔': 'alashan',
    '图木舒克': 'tumushuke',
    '五家渠': 'wujiaqu',
    '北屯': 'beitun',
    '铁门关': 'tiemenguan',
    '双河': 'shuanghe',
    '可克达拉': 'kokdala',
    '昆玉': 'kunyu',
    '胡杨河': 'huyanghe',
    '台北': 'taipei',
    '新北': 'xinbei',
    '桃园': 'taoyuan',
    '台中': 'taichung',
    '台南': 'tainan',
    '高雄': 'kaohsiung',
    '基隆': 'keelung',
    '新竹': 'hsinchu',
    '嘉义': 'chiayi',
    '香港': 'hongkong',
    '澳门': 'macau'
  }

  componentDidShow() {
    const today = this.getTodayDate()
    const tomorrow = this.getTomorrowDate()
    const savedCheckIn = Taro.getStorageSync('selectedCheckIn')
    const savedCheckOut = Taro.getStorageSync('selectedCheckOut')
    
    const isEarlyMorning = this.isEarlyMorning()
    console.log('当前是否凌晨:', isEarlyMorning)
    console.log('今天的日期:', today)
    console.log('明天的日期:', tomorrow)
    console.log('保存的入住日期:', savedCheckIn)
    console.log('保存的退房日期:', savedCheckOut)
    
    const defaultCheckIn = today
    const defaultCheckOut = isEarlyMorning ? today : tomorrow

    console.log('默认入住日期:', defaultCheckIn)
    console.log('默认退房日期:', defaultCheckOut)

    let finalCheckIn, finalCheckOut

    if (savedCheckIn && savedCheckOut && savedCheckIn === today) {
      finalCheckIn = savedCheckIn
      finalCheckOut = savedCheckOut
      console.log('使用保存的日期')
    } else {
      finalCheckIn = defaultCheckIn
      finalCheckOut = defaultCheckOut
      Taro.setStorageSync('selectedCheckIn', finalCheckIn)
      Taro.setStorageSync('selectedCheckOut', finalCheckOut)
      console.log('使用默认日期')
    }

    console.log('最终入住日期:', finalCheckIn)
    console.log('最终退房日期:', finalCheckOut)

    console.log('设置显示提示:', isEarlyMorning)
    this.setState({ showEarlyMorningTip: isEarlyMorning })

    this.loadBanners()
    this.loadRecommendHotels()
    this.loadAllTags()
    this.loadPendingOrder()

    this.setState(prevState => ({
      searchParams: {
        ...prevState.searchParams,
        checkIn: finalCheckIn,
        checkOut: finalCheckOut
      }
    }))

    const systemInfo = Taro.getSystemInfoSync()
    const screenWidth = systemInfo.windowWidth
    const screenHeight = systemInfo.windowHeight
    const bookmarkSize = 65
    const margin = 5

    const savedPosition = Taro.getStorageSync('pendingBookmarkPosition')

    this.setState({
      bookmarkPosition: savedPosition || {
        x: screenWidth - bookmarkSize - margin,
        y: screenHeight - bookmarkSize - margin
      }
    })
  }

  componentDidHide() {
    this.stopCountdown()
  }

  loadBanners = async () => {
    try {
      const startTime = Date.now()
      const banners = await hotelService.getBanners()
      console.log('Banners loaded:', banners)

      const elapsedTime = Date.now() - startTime
      const minSkeletonTime = 800
      const delayTime = Math.max(0, minSkeletonTime - elapsedTime)

      setTimeout(() => {
        this.setState({ bannerList: banners || [] })
      }, delayTime)
    } catch (error) {
      console.error('加载Banner失败:', error)
      this.setState({ bannerList: [] })
    }
  }

  loadRecommendHotels = async () => {
    try {
      const startTime = Date.now()
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      console.log('查询日期:', dateStr)

      const hotels = await hotelService.getRecommendHotels(4, dateStr)
      console.log('Recommend hotels loaded:', hotels)

      const elapsedTime = Date.now() - startTime
      const minSkeletonTime = 800
      const delayTime = Math.max(0, minSkeletonTime - elapsedTime)

      setTimeout(() => {
        this.setState({ recommendHotels: hotels || [] })
      }, delayTime)
    } catch (error) {
      console.error('加载推荐酒店失败:', error)
      this.setState({ recommendHotels: [] })
    }
  }

  loadAllTags = async () => {
    try {
      const startTime = Date.now()
      const tags = await hotelService.getAllTags()
      console.log('All tags loaded:', tags)

      const elapsedTime = Date.now() - startTime
      const minSkeletonTime = 800
      const delayTime = Math.max(0, minSkeletonTime - elapsedTime)

      setTimeout(() => {
        this.setState({ availableTags: tags || [] })
      }, delayTime)
    } catch (error) {
      console.error('加载标签失败:', error)
      this.setState({ availableTags: [] })
    }
  }

  loadPendingOrder = async () => {
    if (!userService.isLoggedIn()) {
      this.setState({ pendingOrder: null, remainingTime: 0 }, () => {
        this.startCountdown()
      })
      return
    }

    try {
      const order = await orderService.getPendingOrder()
      console.log('=== loadPendingOrder ===')
      console.log('order:', order)
      this.setState({ 
        pendingOrder: order,
        remainingTime: order?.remainingTime || 0
      }, () => {
        this.startCountdown()
      })
    } catch (error) {
      console.error('加载待支付订单失败:', error)
      this.setState({ pendingOrder: null, remainingTime: 0 }, () => {
        this.startCountdown()
      })
    }
  }

  startCountdown = () => {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }

    const { remainingTime } = this.state
    if (remainingTime <= 0) {
      return
    }

    this.countdownTimer = setInterval(() => {
      this.setState(prevState => {
        const newRemainingTime = prevState.remainingTime - 1
        if (newRemainingTime > 0) {
          return { remainingTime: newRemainingTime }
        } else {
          clearInterval(this.countdownTimer)
          this.countdownTimer = null
          setTimeout(() => {
            this.loadPendingOrder()
          }, 100)
          return { remainingTime: 0 }
        }
      })
    }, 1000)
  }

  stopCountdown = () => {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    }
  }

  handleBookmarkClick = () => {
    if (this.state.isDragging) return

    if (this.state.pendingOrder) {
      Taro.navigateTo({
        url: `/pages/order/detail?orderId=${this.state.pendingOrder.orderId}`
      })
    }
  }

  handleBookmarkTouchStart = (e) => {
    const touch = e.touches[0]
    this.startX = touch.clientX
    this.startY = touch.clientY
    this.startPositionX = this.state.bookmarkPosition.x
    this.startPositionY = this.state.bookmarkPosition.y
    this.setState({ isDragging: false })
  }

  handleBookmarkTouchMove = (e) => {
    e.stopPropagation()
    e.preventDefault()

    const touch = e.touches[0]
    const deltaX = touch.clientX - this.startX
    const deltaY = touch.clientY - this.startY

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      this.setState({ isDragging: true })
    }

    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }

    this.rafId = requestAnimationFrame(() => {
      let newX = this.startPositionX + deltaX
      let newY = this.startPositionY + deltaY

      const systemInfo = Taro.getSystemInfoSync()
      const screenWidth = systemInfo.windowWidth
      const screenHeight = systemInfo.windowHeight
      const bookmarkSize = 100
      const margin = 10

      newX = Math.max(margin, Math.min(newX, screenWidth - bookmarkSize - margin))
      newY = Math.max(margin, Math.min(newY, screenHeight - bookmarkSize - margin))

      this.setState({
        bookmarkPosition: { x: newX, y: newY }
      })
    })
  }

  handleBookmarkTouchEnd = () => {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    const systemInfo = Taro.getSystemInfoSync()
    const screenWidth = systemInfo.windowWidth
    const screenHeight = systemInfo.windowHeight
    const bookmarkSize = 100
    const bookmarkSize2 = 65
    const margin = 5

    const { bookmarkPosition } = this.state
    const centerX = bookmarkPosition.x + bookmarkSize / 2
    const screenCenterX = screenWidth / 2

    let finalX = bookmarkPosition.x
    if (centerX < screenCenterX) {
      finalX = margin
    } else {
      finalX = screenWidth - bookmarkSize2
    }

    this.setState({
      bookmarkPosition: { x: finalX, y: bookmarkPosition.y },
      isDragging: false
    })

    Taro.setStorageSync('pendingBookmarkPosition', { x: finalX, y: bookmarkPosition.y })
  }

  handleBannerClick = (banner: Banner) => {
    console.log('Banner clicked:', banner)
    const hotelId = banner.hotel?.id || banner.hotelId
    console.log('Final hotelId:', hotelId)
    if (hotelId) {
      const { searchParams } = this.state
      Taro.redirectTo({
        url: `/pages/hotel/detail?id=${hotelId}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}`
      })
      setTimeout(() => {
        Taro.hideLoading()
      }, 100)
    } else {
      Taro.showToast({
        title: '未找到关联酒店',
        icon: 'none'
      })
    }
  }

  handleHotelClick = (hotel: Hotel) => {
    const { searchParams } = this.state
    Taro.redirectTo({
      url: `/pages/hotel/detail?id=${hotel.id}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}`
    })
    setTimeout(() => {
      Taro.hideLoading()
    }, 100)
  }

  renderStars = (starLevel: number) => {
    const stars = []
    for (let i = 0; i < starLevel; i++) {
      stars.push(<Text key={i} className='star'>⭐</Text>)
    }
    return stars
  }

  getTagLabel = (tag: string) => {
    const labelMap: { [key: string]: string } = {
      'wifi': 'WiFi',
      'parking': '停车场',
      'swimming': '泳池',
      'gym': '健身房',
      'restaurant': '餐厅',
      'spa': 'SPA',
      'family': '亲子',
      'luxury': '豪华',
      'business': '商务',
      'airport': '近机场',
      'subway': '近地铁',
      'beachfront': '海滨酒店',
      'ocean_view': '海景房',
      'mountain_view': '山景房',
      'city_view': '城市景观',
      'garden_view': '花园景观',
      'lake_view': '湖景房',
      'river_view': '江景房',
      'park_view': '公园景观',
      'skyline': '天际线景观',
      'rooftop': '屋顶酒吧',
      'terrace': '露台',
      'balcony': '阳台',
      'patio': '庭院',
      'garden': '花园',
      'courtyard': '中庭',
      'historic': '历史建筑',
      'modern': '现代设计',
      'boutique': '精品酒店',
      'design': '设计酒店',
      'art': '艺术酒店',
      'eco': '生态酒店',
      'green': '绿色酒店',
      'sustainable': '可持续酒店',
      'organic': '有机酒店',
      'vegan': '素食友好',
      'gluten_free': '无麸质',
      'halal': '清真食品',
      'kosher': '犹太洁食',
      'pet_friendly': '宠物友好',
      'dog_friendly': '狗狗友好',
      'cat_friendly': '猫咪友好',
      'smoke_free': '无烟酒店',
      'allergy_friendly': '过敏友好',
      'wheelchair_accessible': '轮椅无障碍',
      'hearing_impaired': '听力障碍友好',
      'visually_impaired': '视力障碍友好',
      'autism_friendly': '自闭症友好',
      'honeymoon': '蜜月酒店',
      'wedding': '婚礼场地',
      'anniversary': '纪念日',
      'birthday': '生日派对',
      'bachelor_party': '单身派对',
      'bachelorette_party': '新娘派对',
      'reunion': '家庭聚会',
      'corporate_event': '企业活动',
      'team_building': '团队建设',
      'retreat': '静修',
      'workshop': '研讨会',
      'seminar': '研讨会',
      'conference': '会议',
      'exhibition': '展览',
      'trade_show': '贸易展',
      'fashion_show': '时装秀',
      'concert': '音乐会',
      'performance': '演出',
      'theater': '剧院',
      'cinema': '电影院',
      'nightlife': '夜生活',
      'casino': '赌场',
      'nightclub': '夜店',
      'karaoke': '卡拉OK',
      'live_music': '现场音乐',
      'dj': 'DJ表演',
      'comedy': '喜剧表演',
      'magic_show': '魔术表演',
      'acrobatics': '杂技表演',
      'cultural_show': '文化表演',
      'traditional_show': '传统表演',
      'folk_show': '民俗表演',
      'dance_show': '舞蹈表演',
      'music_show': '音乐表演',
      'art_exhibition': '艺术展览',
      'sculpture_exhibition': '雕塑展览',
      'photography_exhibition': '摄影展览',
      'craft_market': '手工艺市场',
      'flea_market': '跳蚤市场',
      'farmers_market': '农贸市场',
      'food_market': '食品市场',
      'night_market': '夜市',
      'street_food': '街头美食',
      'food_court': '美食广场',
      'hawker_center': '小贩中心',
      'coffee_shop': '咖啡店',
      'tea_house': '茶馆',
      'bakery': '面包店',
      'pastry_shop': '糕点店',
      'ice_cream': '冰淇淋店',
      'juice_bar': '果汁吧',
      'smoothie_bar': '冰沙吧',
      'wine_bar': '葡萄酒吧',
      'whiskey_bar': '威士忌吧',
      'cocktail_bar': '鸡尾酒吧',
      'beer_garden': '啤酒花园',
      'brewery': '酿酒厂',
      'distillery': '蒸馏厂',
      'winery': '酒庄',
      'vineyard': '葡萄园',
      'olive_grove': '橄榄园',
      'orchard': '果园',
      'farm': '农场',
      'ranch': '牧场',
      'vineyard_tour': '葡萄园游览',
      'winery_tour': '酒庄游览',
      'brewery_tour': '酿酒厂游览',
      'distillery_tour': '蒸馏厂游览',
      'farm_tour': '农场游览',
      'orchard_tour': '果园游览',
      'cooking_class': '烹饪课程',
      'wine_tasting': '品酒',
      'beer_tasting': '品啤酒',
      'cheese_tasting': '品奶酪',
      'chocolate_tasting': '品巧克力',
      'coffee_tasting': '品咖啡',
      'tea_tasting': '品茶',
      'olive_oil_tasting': '品橄榄油',
      'honey_tasting': '品蜂蜜',
      'jam_tasting': '品果酱',
      'preserves_tasting': '品果脯',
      'local_food': '当地美食',
      'regional_cuisine': '地方菜系',
      'international_cuisine': '国际菜系',
      'fusion_cuisine': '融合菜系',
      'molecular_cuisine': '分子料理',
      'love': '适合情侣',
      'car': '接送机服务',
      'elderly_friendly': '老年友好',
      'child_friendly': '儿童友好',
      'teen_friendly': '青少年友好',
      'adult_only': '成人专用',
      'women_only': '女性专用',
      'men_only': '男性专用',
      'lgbt_friendly': 'LGBT友好'
    }
    return labelMap[tag] || tag
  }

  handleCityChange = (e) => {
    const cityOptions = ['不限', '北京', '上海', '广州', '深圳', '杭州', '成都']
    const selectedCity = cityOptions[e.detail.value]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        city: selectedCity === '不限' ? '' : selectedCity
      }
    })
  }

  handleLocationClick = async () => {
    console.log('=== 开始定位流程 ===')
    
    try {
      console.log('1. 获取用户设置')
      const setting = await Taro.getSetting()
      console.log('用户设置:', setting)
      console.log('定位权限状态:', setting.authSetting['scope.userLocation'])

      if (setting.authSetting['scope.userLocation'] === false) {
        console.log('2. 用户之前拒绝过授权，引导到设置')
        Taro.showModal({
          title: '提示',
          content: '需要获取您的位置信息来推荐附近酒店，请在设置中开启定位权限',
          confirmText: '去设置',
          success: (modalRes) => {
            if (modalRes.confirm) {
              Taro.openSetting()
            }
          }
        })
        this.setState({ locating: false })
        return
      }

      console.log('2. 直接获取位置（会自动触发授权）')
      this.setState({ locating: true })

      const res = await Taro.getLocation({
        type: 'wgs84'
      })
      console.log('位置获取成功:', res)
      console.log('经纬度:', { latitude: res.latitude, longitude: res.longitude })

      const { latitude, longitude } = res
      this.reverseGeocode(latitude, longitude)
    } catch (err) {
      console.error('=== 定位流程失败 ===')
      console.error('错误信息:', err)
      console.error('错误详情:', JSON.stringify(err))
      
      if (err.errMsg && err.errMsg.includes('no permission')) {
        console.log('错误类型: 无权限')
        Taro.showModal({
          title: '提示',
          content: '需要获取您的位置信息来推荐附近酒店，请在设置中开启定位权限',
          confirmText: '去设置',
          success: (modalRes) => {
            if (modalRes.confirm) {
              Taro.openSetting()
            }
          }
        })
      } else if (err.errMsg && err.errMsg.includes('authorize:fail')) {
        console.log('错误类型: 授权失败')
        Taro.showToast({
          title: '授权失败，请重试',
          icon: 'none'
        })
      } else {
        console.log('错误类型: 其他错误')
        Taro.showToast({
          title: '定位失败，请检查定位权限',
          icon: 'none'
        })
      }
      
      this.setState({ locating: false })
    }
  }

  reverseGeocode = (latitude: number, longitude: number) => {
    const BASE_URL = 'http://localhost:8888'
    const AMAP_KEY = 'cbb0e9da5dc2bd7edb1d5cb63af8e039'
    const url = `${BASE_URL}/mini/hotel/location?location=${longitude},${latitude}&key=${AMAP_KEY}`

    Taro.request({
      url: url,
      method: 'GET'
    }).then(res => {
      if (res.statusCode === 200 && res.data.code === 200 && res.data.data.status === '1') {
        const result = res.data.data.regeocode
        const addressComponent = result.addressComponent
        const province = addressComponent.province
        const originalCity = (addressComponent.city && addressComponent.city.length > 0) ? addressComponent.city : addressComponent.province
        let city = originalCity.replace(/市$/, '')
        const district = addressComponent.district
        const township = addressComponent.township
        const street = addressComponent.streetNumber && addressComponent.street ? `${addressComponent.street}${addressComponent.streetNumber}` : addressComponent.street
        const formattedAddress = result.formatted_address

        const cityPinyin = this.cityPinyinMap[city] || city.toLowerCase()

        const isDirectCity = province === originalCity
        const displayAddress = isDirectCity 
          ? `${originalCity}，${district}` 
          : `${province}，${originalCity}，${district}`

        this.setState({
          searchParams: {
            ...this.state.searchParams,
            city: cityPinyin
          },
          displayCity: city,
          locationBubble: {
            visible: true,
            city: city,
            address: displayAddress
          },
          locating: false
        })

        setTimeout(() => {
          this.setState(prevState => ({
            locationBubble: {
              ...prevState.locationBubble,
              visible: false
            }
          }))
        }, 30000)
      } else {
        throw new Error('逆地理编码失败')
      }
    }).catch(err => {
      console.error('逆地理编码失败:', err)
      Taro.showToast({
        title: '获取位置信息失败',
        icon: 'none'
      })
      this.setState({ locating: false })
    })
  }

  handleHotelNameChange = (e) => {
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        hotelName: e.detail.value
      }
    })
  }

  handleHotelNameFocus = () => {
    this.setState({ isHotelNameFocused: true })
  }

  handleHotelNameBlur = () => {
    this.setState({ isHotelNameFocused: false })
  }

  handleStarChange = (e) => {
    const selectedStar = this.state.starLevels[e.detail.value]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        starLevel: selectedStar.value
      }
    })
  }

  handleTagToggle = (tag: { label: string, value: string }) => {
    const { tags } = this.state.searchParams
    const newTags = tags.includes(tag.value)
      ? tags.filter(t => t !== tag.value)
      : [...tags, tag.value]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        tags: newTags
      }
    })
  }

  handlePriceClick = () => {
    this.setState({ showPriceModal: true })
  }

  handlePriceConfirm = (minPrice: number, maxPrice: number) => {
    this.setState({
      showPriceModal: false,
      searchParams: {
        ...this.state.searchParams,
        minPrice,
        maxPrice
      }
    })
  }

  handlePriceCancel = () => {
    this.setState({ showPriceModal: false })
  }

  handleStarClick = () => {
    this.setState({ showStarModal: true })
  }

  handleStarConfirm = (starLevel: number) => {
    this.setState({
      showStarModal: false,
      searchParams: {
        ...this.state.searchParams,
        starLevel
      }
    })
  }

  handleStarCancel = () => {
    this.setState({ showStarModal: false })
  }

  handleCityClick = () => {
    this.setState({ showCityModal: true, showEarlyMorningTip: false })
  }

  handleEarlyMorningTipClick = () => {
    this.setState({ showEarlyMorningTip: false })
  }

  handleCityConfirm = () => {
    this.setState({ showCityModal: false })
  }

  handleCityCancel = () => {
    this.setState({ showCityModal: false })
  }

  handleCitySelect = (city) => {
    const cityPinyin = city === '不限' ? '' : (this.cityPinyinMap[city] || city.toLowerCase())
    this.setState(prevState => ({
      searchParams: {
        ...prevState.searchParams,
        city: cityPinyin
      },
      displayCity: city === '不限' ? '' : city
    }))
  }

  handleCheckInClick = () => {
    this.setState({ showCalendar: true, calendarType: 'checkIn' })
  }

  handleCheckOutClick = () => {
    this.setState({ showCalendar: true, calendarType: 'checkOut' })
  }

  handleCalendarConfirm = (startDate: string, endDate: string) => {
    const today = this.getTodayDate()
    const shouldShowTip = startDate === today && endDate === today && this.isEarlyMorning()
    
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        checkIn: startDate,
        checkOut: endDate
      },
      showCalendar: false,
      showEarlyMorningTip: shouldShowTip
    })
    
    Taro.setStorageSync('selectedCheckIn', startDate)
    Taro.setStorageSync('selectedCheckOut', endDate)
  }

  handleCalendarClose = () => {
    this.setState({ showCalendar: false })
  }

  formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  handlePendingBannerClick = () => {
    const { pendingOrder } = this.state
    if (pendingOrder && pendingOrder.orderId) {
      Taro.navigateTo({
        url: `/pages/order/detail?orderId=${pendingOrder.orderId}`
      })
    }
  }

  formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parseInt(parts[1])}月${parseInt(parts[2])}日`
    }
    return dateStr
  }

  handleSearch = async () => {
    const { searchParams } = this.state
    Taro.showToast({
      title: '搜索中...',
      icon: 'loading'
    })

    try {
      const hotels = await hotelService.searchHotels({
        city: searchParams.city,
        keyword: searchParams.hotelName,
        starLevel: searchParams.starLevel > 0 ? searchParams.starLevel : undefined,
        tags: searchParams.tags,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        minPrice: searchParams.minPrice > 0 ? searchParams.minPrice : undefined,
        maxPrice: searchParams.maxPrice < 2000 ? searchParams.maxPrice : undefined
      })

      Taro.hideToast()

      const hotelsStr = encodeURIComponent(JSON.stringify(hotels))
      const searchParamsStr = encodeURIComponent(JSON.stringify(searchParams))

      Taro.navigateTo({
        url: `/pages/hotel/list?hotels=${hotelsStr}&searchParams=${searchParamsStr}`
      })
    } catch (error) {
      console.error('搜索失败:', error)
      Taro.showToast({
        title: '搜索失败，请重试',
        icon: 'none'
      })
    }
  }



  render() {
    const { bannerList, recommendHotels, availableTags, pendingOrder, remainingTime, searchParams, displayCity, showPriceModal, showStarModal, showCityModal, locationBubble, bookmarkPosition, showEarlyMorningTip } = this.state
    const isLoading = bannerList.length === 0 || recommendHotels.length === 0 || availableTags.length === 0

    return (
      <View className='index'>
        {locationBubble.visible && (
          <View className='location-bubble'>
            <Text className='bubble-text'>📍{locationBubble.address}</Text>
          </View>
        )}
        <View className='banner-section'>
          <View className='banner-gradient-overlay'></View>
          {bannerList.length > 0 ? (
            <Swiper className='banner-swiper' indicatorDots autoplay circular catchMove>
              {bannerList.map((banner) => (
                <SwiperItem key={banner.id}>
                  <View className='banner-item' onClick={() => this.handleBannerClick(banner)}>
                    {banner.coverImage && <Image className='banner-image' src={banner.coverImage} mode='aspectFill' lazyLoad />}
                  </View>
                </SwiperItem>
              ))}
            </Swiper>
          ) : (
            isLoading ? (
              <Skeleton type='banner' showContent={true} />
            ) : (
              <View className='banner-placeholder'>
                <Text>暂无轮播图</Text>
              </View>
            )
          )}
        </View>

        <View className='search-section'>
          <View className='search-title'>
            <Text className='title-text'>搜索酒店</Text>
          </View>

          <View className='search-form'>
            <View className='form-row'>
              <View className='form-item'>
                <Text className='form-label'>城市</Text>
                <View className='form-value-row'>
                  <View className='form-value' onClick={this.handleCityClick}>
                    <Text>{this.state.displayCity || '不限'}</Text>
                    <Text className='arrow'>▼</Text>
                  </View>
                  <View className='location-btn' onClick={this.handleLocationClick}>
                    <Text className={`location-icon ${this.state.locating ? 'locating' : ''}`}>🌍</Text>
                  </View>
                </View>
              </View>

              <View className='form-item'>
                <Text className='form-label'>酒店名称</Text>
                <View className='input-wrapper'>
                  {!this.state.searchParams.hotelName && !this.state.isHotelNameFocused && (
                    <Text className='input-placeholder'>请输入酒店名称</Text>
                  )}
                  <Input
                    className='form-input'
                    value={this.state.searchParams.hotelName}
                    onInput={this.handleHotelNameChange}
                    onFocus={this.handleHotelNameFocus}
                    onBlur={this.handleHotelNameBlur}
                  />
                </View>
              </View>
            </View>

            <View className='form-row'>
              <View className='form-item' onClick={this.handleCheckInClick}>
                <Text className='form-label'>入住日期</Text>
                <View className='form-value'>
                  <Text>{this.formatDateDisplay(this.state.searchParams.checkIn)}</Text>
                  <Text className='arrow'>▼</Text>
                </View>
              </View>
              <View className='form-item' onClick={this.handleCheckOutClick}>
                <Text className='form-label'>退房日期</Text>
                <View className='form-value'>
                  <Text>{this.formatDateDisplay(this.state.searchParams.checkOut)}</Text>
                  <Text className='arrow'>▼</Text>
                </View>
              </View>
              {showEarlyMorningTip && (
                <View className='early-morning-tip'>
                  <Text className='tip-text'>🌙当前时间已过0点，已选择今天凌晨6点前入住，中午离店</Text>
                </View>
              )}
            </View>

            <View className='form-row'>
              <View className='form-item half-width'>
                <Text className='form-label'>价格</Text>
                <View className='form-value' onClick={this.handlePriceClick}>
                  <Text>{searchParams.minPrice === 0 && searchParams.maxPrice >= 2000 ? '不限' : `¥${searchParams.minPrice} - ${searchParams.maxPrice >= 2000 ? '2000以上' : searchParams.maxPrice}`}</Text>
                  <Text className='arrow'>▼</Text>
                </View>
              </View>
              <View className='form-item half-width'>
                <Text className='form-label'>星级</Text>
                <View className='form-value' onClick={this.handleStarClick}>
                  <Text>{searchParams.starLevel === 0 ? '不限' : `${searchParams.starLevel}星级`}</Text>
                  <Text className='arrow'>▼</Text>
                </View>
              </View>
            </View>

            <View className='form-item'>
              <Text className='form-label'>酒店标签</Text>
              <View className='tags-container'>
                <View
                  className={`tag-item ${this.state.searchParams.tags.length === 0 ? 'active' : ''}`}
                  onClick={() => this.setState({ searchParams: { ...this.state.searchParams, tags: [] } })}
                >
                  <Text className='tag-text'>不限</Text>
                </View>
                {this.state.availableTags.map((tag, index) => (
                  <View
                    key={index}
                    className={`tag-item ${this.state.searchParams.tags.includes(tag) ? 'active' : ''}`}
                    onClick={() => this.handleTagToggle({ label: this.getTagLabel(tag), value: tag })}
                  >
                    <Text className='tag-text'>{this.getTagLabel(tag)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className='search-btn' onClick={this.handleSearch}>
            <Text className='search-btn-text'>立即查询</Text>
          </View>
        </View>

        <View className='recommend-section'>
          <View className='section-header'>
            <Text className='section-title'>为你推荐</Text>
            <View className='refresh-btn' onClick={this.loadRecommendHotels}>
              <Text className='refresh-icon'>↻</Text>
              <Text className='refresh-text'>换一批</Text>
            </View>
          </View>
          <View className='hotel-list'>
            {recommendHotels.length > 0 ? (
              recommendHotels.map((hotel) => (
                <View key={hotel.id} className='hotel-card' onClick={() => this.handleHotelClick(hotel)}>
                  {hotel.coverImage && <Image className='hotel-cover' src={hotel.coverImage} mode='aspectFill' lazyLoad />}
                  <View className='hotel-content'>
                    <Text className='hotel-name'>{hotel.hotelName}</Text>
                    <Text className='hotel-name-en'>{hotel.hotelNameEn}</Text>
                    <View className='hotel-stars'>
                      {this.renderStars(hotel.starLevel)}
                    </View>
                    {hotel.tags && Array.isArray(hotel.tags) && hotel.tags.length > 0 && (
                      <View className='hotel-tags'>
                        {hotel.tags.map((tag, index) => (
                          <Text key={index} className='hotel-tag'>{this.getTagLabel(tag)}</Text>
                        ))}
                      </View>
                    )}
                    <View className='hotel-address'>📍 {hotel.address}</View>
                    {hotel.minPrice && (
                      <View className='hotel-price'>
                        <Text className='price'>¥{hotel.minPrice}</Text>
                        <Text className='price-unit'>起</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            ) : isLoading ? (
              <>
                <Skeleton type='card' showContent={true} />
                <Skeleton type='card' showContent={true} />
                <Skeleton type='card' showContent={true} />
                <Skeleton type='card' showContent={true} />
              </>
            ) : (
              <View className='empty-tip'>
                <Text>暂无推荐酒店</Text>
              </View>
            )}
          </View>
        </View>

        <Calendar
          visible={this.state.showCalendar}
          startDate={this.state.searchParams.checkIn}
          endDate={this.state.searchParams.checkOut}
          onConfirm={this.handleCalendarConfirm}
          onClose={this.handleCalendarClose}
        />

        <PriceSelector
          visible={showPriceModal}
          minPrice={searchParams.minPrice}
          maxPrice={searchParams.maxPrice}
          onConfirm={this.handlePriceConfirm}
          onClose={this.handlePriceCancel}
        />

        <StarSelector
          visible={showStarModal}
          starLevel={searchParams.starLevel}
          onConfirm={this.handleStarConfirm}
          onClose={this.handleStarCancel}
        />

        <CitySelector
          visible={showCityModal}
          selectedCity={displayCity}
          onConfirm={this.handleCitySelect}
          onClose={this.handleCityCancel}
        />

        {pendingOrder && remainingTime > 0 && (
          <View
            className='pending-bookmark'
            style={{
              left: `${bookmarkPosition.x}px`,
              top: `${bookmarkPosition.y}px`
            }}
            onClick={this.handleBookmarkClick}
            onTouchStart={this.handleBookmarkTouchStart}
            onTouchMove={this.handleBookmarkTouchMove}
            onTouchEnd={this.handleBookmarkTouchEnd}
            catchTouchMove
          >
            <Text className='bookmark-icon'>⏰</Text>
            <Text className='bookmark-time'>{this.formatCountdown(remainingTime)}</Text>
          </View>
        )}

      </View>
    )
  }
}
