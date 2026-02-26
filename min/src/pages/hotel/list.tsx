import React, { Component } from 'react'
import { View, Text, Image, Input, Picker, Button, ScrollView } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { Hotel, hotelService } from '../../services/hotel.service'
import { orderService } from '../../services/order.service'
import { userService } from '../../services/user.service'
import Calendar from '../../components/calendar/calendar'
import CitySelector from '../../components/city-selector/city-selector'
import PriceSelector from '../../components/price-selector/price-selector'
import StarSelector from '../../components/star-selector/star-selector'
import Skeleton from '../../components/skeleton/skeleton'
import CountdownTimer from '../../components/countdown-timer/countdown-timer'
import { debounce } from '../../utils/debounce'
import './list.scss'

interface SearchParams {
  city: string
  hotelName: string
  checkIn: string
  checkOut: string
  minPrice: number
  maxPrice: number
  starLevel: number
  tags: string[]
  rooms: number
  adults: number
  children: number
}

interface HotelListState {
  hotels: Hotel[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  page: number
  pageSize: number
  searchParams: SearchParams
  displayCity: string
  showCityDatePanel: boolean
  showGuestPanel: boolean
  showCalendar: boolean
  calendarType: 'checkIn' | 'checkOut'
  pendingOrder: any
  remainingTime: number
  bookmarkPosition: { x: number; y: number }
  isDragging: boolean
  showPriceModal: boolean
  showStarModal: boolean
  showCityModal: boolean
  isHotelNameFocused: boolean
  locating: boolean
  wasLoggedIn: boolean
  isInitialized: boolean
}

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTomorrowDate = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default class HotelList extends Component<{}, HotelListState> {
  countdownTimer: any = null
  loadCount: number = 0  // 添加加载计数器

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

  state: HotelListState = {
    hotels: [],
    loading: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    pageSize: 5,
    searchParams: {
      city: '',
      hotelName: '',
      checkIn: getTodayDate(),
      checkOut: getTomorrowDate(),
      minPrice: 0,
      maxPrice: 2000,
      starLevel: 0,
      tags: [],
      rooms: 1,
      adults: 1,
      children: 0
    },
    displayCity: '',
    showCityDatePanel: false,
    showGuestPanel: false,
    showCalendar: false,
    calendarType: 'checkIn',
    pendingOrder: null,
    remainingTime: 0,
    bookmarkPosition: { x: 300, y: 600 },
    isDragging: false,
    showPriceModal: false,
    showStarModal: false,
    showCityModal: false,
    isHotelNameFocused: false,
    locating: false,
    wasLoggedIn: false,
    isInitialized: false
  }

  componentDidShow() {
    console.log('=== HotelList componentDidShow START ===')
    const instance = getCurrentInstance()
    const { hotels, searchParams } = instance.router?.params || {}

    const savedCheckIn = Taro.getStorageSync('selectedCheckIn')
    const savedCheckOut = Taro.getStorageSync('selectedCheckOut')
    const savedRooms = Taro.getStorageSync('selectedRooms')
    const savedAdults = Taro.getStorageSync('selectedAdults')
    const savedChildren = Taro.getStorageSync('selectedChildren')
    const token = userService.getToken()
    const isLoggedIn = !!token

    console.log('componentDidShow token:', token)
    console.log('savedCheckIn:', savedCheckIn)
    console.log('savedCheckOut:', savedCheckOut)
    console.log('savedRooms:', savedRooms)
    console.log('savedAdults:', savedAdults)
    console.log('savedChildren:', savedChildren)
    console.log('wasLoggedIn:', this.state.wasLoggedIn)
    console.log('isLoggedIn:', isLoggedIn)

    if (searchParams) {
      console.log('有searchParams，解析并加载')
      if (!this.state.isInitialized) {
        console.log('首次加载，初始化酒店列表')
        try {
          const parsedParams = JSON.parse(decodeURIComponent(searchParams))
          if (savedCheckIn && savedCheckOut) {
            parsedParams.checkIn = savedCheckIn
            parsedParams.checkOut = savedCheckOut
          }
          if (savedRooms) {
            parsedParams.rooms = savedRooms
          }
          if (savedAdults) {
            parsedParams.adults = savedAdults
          }
          if (savedChildren) {
            parsedParams.children = savedChildren
          }
          this.setState({ 
            searchParams: parsedParams,
            isInitialized: true
          }, () => {
            this.loadInitialHotels()
          })
        } catch (error) {
          console.error('解析搜索参数失败:', error)
          this.setState({ isInitialized: true })
        }
      } else {
        console.log('已初始化，跳过加载')
      }
    } else {
      console.log('无searchParams，检查是否需要重新加载')
      let shouldReload = false
      if (savedCheckIn && savedCheckOut) {
        const currentCheckIn = this.state.searchParams.checkIn
        const currentCheckOut = this.state.searchParams.checkOut
        console.log('当前入住日期:', currentCheckIn, '保存的入住日期:', savedCheckIn)
        console.log('当前退房日期:', currentCheckOut, '保存的退房日期:', savedCheckOut)
        if (currentCheckIn !== savedCheckIn || currentCheckOut !== savedCheckOut) {
          shouldReload = true
        }
      }
      if (savedRooms || savedAdults || savedChildren) {
        shouldReload = true
      }
      if (isLoggedIn && !this.state.wasLoggedIn) {
        console.log('用户刚刚登录，需要重新加载酒店列表')
        shouldReload = true
      }
      console.log('shouldReload:', shouldReload)
      this.setState(prevState => ({
        searchParams: {
          ...prevState.searchParams,
          checkIn: savedCheckIn || prevState.searchParams.checkIn,
          checkOut: savedCheckOut || prevState.searchParams.checkOut,
          rooms: savedRooms || prevState.searchParams.rooms,
          adults: savedAdults || prevState.searchParams.adults,
          children: savedChildren !== undefined ? savedChildren : prevState.searchParams.children
        },
        wasLoggedIn: isLoggedIn
      }), () => {
        if (shouldReload) {
          console.log('开始重新加载酒店列表')
          this.loadInitialHotels()
        }
      })
    }

    this.loadPendingOrder()
    console.log('=== HotelList componentDidShow END ===')
  }

  loadPendingOrder = async () => {
    console.log('=== loadPendingOrder START ===')
    try {
      const token = userService.getToken()
      console.log('loadPendingOrder token:', token)
      if (!token) {
        console.log('用户未登录，清空待支付订单')
        this.setState({ pendingOrder: null, remainingTime: 0 })
        return
      }

      console.log('开始获取待支付订单')
      const order = await orderService.getPendingOrder()
      console.log('待支付订单:', order)
      this.setState({
        pendingOrder: order,
        remainingTime: order?.remainingTime || 0
      })

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
    } catch (error) {
      console.error('加载待支付订单失败:', error)
      this.setState({ pendingOrder: null, remainingTime: 0 })
    }
    console.log('=== loadPendingOrder END ===')
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
    const touch = e.touches[0]
    const deltaX = touch.clientX - this.startX
    const deltaY = touch.clientY - this.startY

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      this.setState({ isDragging: true })
    }

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
  }

  handleBookmarkTouchEnd = () => {
    const systemInfo = Taro.getSystemInfoSync()
    const screenWidth = systemInfo.windowWidth
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

  loadInitialHotels = async () => {
    const { searchParams, pageSize } = this.state

    this.loadCount++
    console.log('=== loadInitialHotels START ===', '调用次数:', this.loadCount)
    console.log('当前pageSize:', pageSize)
    console.log('当前hotels数量:', this.state.hotels.length)

    this.setState({ loading: true })

    try {
      const startTime = Date.now()

      const result = await hotelService.searchHotels({
        city: searchParams.city,
        keyword: searchParams.hotelName,
        starLevel: searchParams.starLevel > 0 ? searchParams.starLevel : undefined,
        tags: searchParams.tags,
        page: 1,
        pageSize: pageSize,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        minPrice: searchParams.minPrice > 0 ? searchParams.minPrice : undefined,
        maxPrice: searchParams.maxPrice < 2000 ? searchParams.maxPrice : undefined
      })

      console.log('后端返回数据数量:', result.length)
      console.log('后端返回数据:', result)

      const elapsedTime = Date.now() - startTime
      const minSkeletonTime = 800
      const delayTime = Math.max(0, minSkeletonTime - elapsedTime)

      setTimeout(() => {
        console.log('=== setTimeout 执行 ===')
        console.log('result:', result)
        console.log('result.length:', result.length)
        console.log('pageSize:', pageSize)
        console.log('result.length >= pageSize:', result.length >= pageSize)

        if (result && result.length > 0) {
          this.setState({
            hotels: result,
            page: 1,
            hasMore: result.length >= pageSize
          })
          console.log('设置hotels数量:', result.length)
          console.log('设置hasMore:', result.length >= pageSize)
        } else {
          this.setState({ hotels: [], hasMore: false })
          console.log('设置hasMore: false')
        }
      }, delayTime)
    } catch (error) {
      console.error('加载酒店失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setState({ loading: false })
    }
  }

  handleHotelNameChange = debounce((e: any) => {
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        hotelName: e.detail.value
      }
    })
  }, 500)

  handleHotelNameFocus = () => {
    this.setState({ isHotelNameFocused: true })
  }

  handleHotelNameBlur = () => {
    this.setState({ isHotelNameFocused: false })
  }

  loadMoreHotels = async () => {
    const { loadingMore, hasMore, page, searchParams, pageSize } = this.state

    console.log('=== loadMoreHotels START ===')
    console.log('loadingMore:', loadingMore, 'hasMore:', hasMore)

    if (loadingMore || !hasMore) return

    console.log('开始加载，设置loadingMore为true')
    this.setState({ loadingMore: true })

    const startTime = Date.now()

    try {
      const newPage = page + 1
      console.log('加载第', newPage, '页')
      const result = await hotelService.searchHotels({
        city: searchParams.city,
        keyword: searchParams.hotelName,
        starLevel: searchParams.starLevel > 0 ? searchParams.starLevel : undefined,
        tags: searchParams.tags,
        page: newPage,
        pageSize: pageSize,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        minPrice: searchParams.minPrice > 0 ? searchParams.minPrice : undefined,
        maxPrice: searchParams.maxPrice < 2000 ? searchParams.maxPrice : undefined
      })

      console.log('加载完成，返回', result.length, '条数据')

      const minLoadingTime = 880
      const elapsedTime = Date.now() - startTime
      const delayTime = Math.max(0, minLoadingTime - elapsedTime)

      setTimeout(() => {
        if (result && result.length > 0) {
          this.setState({
            hotels: [...this.state.hotels, ...result],
            page: newPage,
            hasMore: result.length >= pageSize,
            loadingMore: false
          })
        } else {
          this.setState({ hasMore: false, loadingMore: false })
        }
      }, delayTime)
    } catch (error) {
      console.error('加载更多失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setState({ loadingMore: false })
    }
  }

  handleScrollToLower = () => {
    this.loadMoreHotels()
  }

  handleCityDateClick = () => {
    this.setState({ showCityDatePanel: !this.state.showCityDatePanel, showGuestPanel: false })
  }

  handleCityClick = async () => {
    this.setState({ locating: true })
    await this.getCurrentLocation()
  }

  handleCityPickerClick = () => {
    this.setState({ showCityModal: true })
  }

  handleCityCancel = () => {
    this.setState({ showCityModal: false })
  }

  getCurrentLocation = async () => {
    try {
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
          locating: false
        })

        Taro.showToast({
          title: `已定位到${city}`,
          icon: 'success'
        })
      } else {
        console.error('逆地理编码失败:', res)
        Taro.showToast({
          title: '定位失败，请重试',
          icon: 'none'
        })
        this.setState({ locating: false })
      }
    }).catch(err => {
      console.error('请求失败:', err)
      Taro.showToast({
        title: '定位失败，请重试',
        icon: 'none'
      })
      this.setState({ locating: false })
    })
  }

  handleCheckInClick = () => {
    this.setState({ showCalendar: true, calendarType: 'checkIn' })
  }

  handleCheckOutClick = () => {
    this.setState({ showCalendar: true, calendarType: 'checkOut' })
  }

  handleCalendarConfirm = (startDate: string, endDate: string) => {
    this.setState({
      showCityDatePanel: false,
      searchParams: {
        ...this.state.searchParams,
        checkIn: startDate,
        checkOut: endDate
      },
      showCalendar: false
    })
    Taro.setStorageSync('selectedCheckIn', startDate)
    Taro.setStorageSync('selectedCheckOut', endDate)
  }

  handleCalendarClose = () => {
    this.setState({ showCalendar: false })
  }

  handleGuestClick = () => {
    this.setState({ showGuestPanel: !this.state.showGuestPanel, showCityDatePanel: false })
  }

  handleCitySelect = (city) => {
    const cityPinyin = city === '不限' ? '' : (this.cityPinyinMap[city] || city.toLowerCase())
    this.setState(prevState => ({
      showCityDatePanel: false,
      searchParams: {
        ...prevState.searchParams,
        city: cityPinyin
      },
      displayCity: city === '不限' ? '' : city
    }))
  }

  handleCheckInChange = (e) => {
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        checkIn: e.detail.value
      }
    })
  }

  handleCheckOutChange = (e) => {
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        checkOut: e.detail.value
      }
    })
  }

  handleRoomsChange = (e) => {
    const roomOptions = [1, 2, 3, 4, 5]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        rooms: roomOptions[e.detail.value]
      }
    })
  }

  handleAdultsChange = (e) => {
    const adultOptions = [1, 2, 3, 4, 5]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        adults: adultOptions[e.detail.value]
      }
    })
  }

  handleChildrenChange = (e) => {
    const childOptions = [0, 1, 2, 3, 4]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        children: childOptions[e.detail.value]
      }
    })
  }

  handleSearch = () => {
    const { searchParams } = this.state
    this.setState({ showCityDatePanel: false, showGuestPanel: false })
    this.loadInitialHotels()
  }

  handleStarConfirm = (starLevel: number) => {
    this.setState({
      showStarModal: false,
      showCityDatePanel: false,
      searchParams: {
        ...this.state.searchParams,
        starLevel
      }
    })
  }

  handleStarCancel = () => {
    this.setState({ showStarModal: false })
  }

  handlePriceConfirm = (minPrice: number, maxPrice: number) => {
    this.setState({
      showPriceModal: false,
      showCityDatePanel: false,
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

  handleHotelClick = (hotelId: string) => {
    const { searchParams } = this.state
    Taro.navigateTo({
      url: `/pages/hotel/detail?id=${hotelId}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}&rooms=${searchParams.rooms}&adults=${searchParams.adults}&children=${searchParams.children}`
    })
    setTimeout(() => {
      Taro.hideLoading()
    }, 100)
  }

  formatDateDisplay = (dateStr: string) => {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return (
        <View className='date-display'>
          <Text className='date-month'>{parseInt(parts[1])}月</Text>
          <Text className='date-day'>{parseInt(parts[2])}日</Text>
        </View>
      )
    } else if (parts.length >= 2) {
      return (
        <View className='date-display'>
          <Text className='date-month'>{parts[0]}月</Text>
          <Text className='date-day'>{parts[1]}日</Text>
        </View>
      )
    }
    return <Text>{dateStr}</Text>
  }

  formatDateDisplaySimple = (dateStr: string): string => {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parseInt(parts[1])}月${parseInt(parts[2])}日`
    } else if (parts.length >= 2) {
      return `${parts[0]}月${parts[1]}日`
    }
    return dateStr
  }

  calculateNights = () => {
    const { checkIn, checkOut } = this.state.searchParams
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  renderPrice = (minPrice?: number) => {
    const token = userService.getToken()
    const isLoggedIn = !!token

    console.log('=== renderPrice ===')
    console.log('token:', token)
    console.log('isLoggedIn:', isLoggedIn)
    console.log('minPrice:', minPrice)

    if (!isLoggedIn) {
      console.log('用户未登录，显示登录按钮')
      return (
        <View className='hotel-price'>
          <View className='login-for-price-btn' onClick={(e) => {
            e.stopPropagation()
            Taro.navigateTo({
              url: '/pages/login/login'
            })
          }}>
            <Text className='login-for-price-text'>登录看低价</Text>
          </View>
        </View>
      )
    }

    if (!minPrice) {
      console.log('minPrice为空，不显示价格')
      return null
    }

    const nights = this.calculateNights()

    if (nights === 1) {
      console.log('显示1晚价格:', minPrice)
      return (
        <View className='hotel-price'>
          <Text className='price'>¥{minPrice}</Text>
          <Text className='price-unit'>起</Text>
        </View>
      )
    } else {
      console.log('显示多晚均价:', minPrice)
      return (
        <View className='hotel-price'>
          <Text className='price-label'>均价</Text>
          <Text className='price'>¥{minPrice}</Text>
          <Text className='price-unit'>起</Text>
        </View>
      )
    }
  }

  render() {
    console.log('=== render called ===')
    const { hotels, searchParams, displayCity, showCityDatePanel, showGuestPanel, showCalendar, loadingMore, hasMore, pendingOrder, remainingTime, bookmarkPosition, showPriceModal, showStarModal, showCityModal, locating } = this.state

    console.log('render - hasMore:', hasMore, 'loadingMore:', loadingMore, 'hotels.length:', hotels.length)

    return (
      <View className='hotel-list-page'>
        <View className='search-bar'>
          <View className='search-main-row'>
            <View className='search-city' onClick={this.handleCityDateClick}>
              <Text className='city-text'>{displayCity || '城市'}</Text>
              <Text className='arrow'>▼</Text>
            </View>
            <View className='search-dates' onClick={this.handleCityDateClick}>
              <View className='date-item'>
                <Text className='date-label'>入住</Text>
                {this.formatDateDisplay(searchParams.checkIn)}
              </View>
              <Text className='date-separator'>-</Text>
              <View className='date-item'>
                <Text className='date-label'>离店</Text>
                {this.formatDateDisplay(searchParams.checkOut)}
              </View>
            </View>
            <View className='search-hotel-name'>
              <View className='hotel-name-wrapper'>
                {!searchParams.hotelName && !this.state.isHotelNameFocused && (
                  <Text className='hotel-name-placeholder'>酒店名称</Text>
                )}
                <Input
                  className='hotel-name-input'
                  value={searchParams.hotelName}
                  onInput={this.handleHotelNameChange}
                  onFocus={this.handleHotelNameFocus}
                  onBlur={this.handleHotelNameBlur}
                />
              </View>
            </View>
          </View>

          {showCityDatePanel && (
            <View className='city-date-mask' onClick={() => this.setState({ showCityDatePanel: false })}>
              <View className='city-date-panel' onClick={(e) => e.stopPropagation()}>
                <ScrollView className='panel-scroll' scrollY>
                  <View className='panel-content'>
                    <View className='panel-row'>
                      <Text className='panel-label'>城市</Text>
                      <View className='location-icon' onClick={locating ? null : this.handleCityClick}>🌏</View>
                      <View className='panel-picker' onClick={locating ? null : this.handleCityPickerClick}>
                        <Text>{locating ? '定位中...' : (displayCity || '不限')}</Text>
                        <Text className='picker-arrow'>▼</Text>
                      </View>
                    </View>
                    <View className='panel-row' onClick={this.handleCheckInClick}>
                      <Text className='panel-label'>入住日期</Text>
                      <View className='panel-picker'>
                        <Text>{this.formatDateDisplaySimple(searchParams.checkIn)}</Text>
                        <Text className='picker-arrow'>▼</Text>
                      </View>
                    </View>
                    <View className='panel-row' onClick={this.handleCheckOutClick}>
                      <Text className='panel-label'>离店日期</Text>
                      <View className='panel-picker'>
                        <Text>{this.formatDateDisplaySimple(searchParams.checkOut)}</Text>
                        <Text className='picker-arrow'>▼</Text>
                      </View>
                    </View>
                    <View className='panel-row' style={{flexWrap: 'wrap'}}>
                      <View className='panel-half-row' style={{width: '48%', marginRight: '4%'}}>
                        <Text className='panel-label'>价格</Text>
                        <View className='panel-picker' onClick={() => this.setState({ showPriceModal: true })}>
                          <Text>¥{searchParams.minPrice} - {searchParams.maxPrice >= 2000 ? '2000以上' : searchParams.maxPrice}</Text>
                          <Text className='picker-arrow'>▼</Text>
                        </View>
                      </View>
                      <View className='panel-half-row' style={{width: '48%'}}>
                        <Text className='panel-label'>星级</Text>
                        <View className='panel-picker' onClick={() => this.setState({ showStarModal: true })}>
                          <Text>{searchParams.starLevel > 0 ? searchParams.starLevel + '星' : '不限'}</Text>
                          <Text className='picker-arrow'>▼</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </ScrollView>
                <View className='panel-footer'>
                  <Button className='panel-btn' onClick={this.handleSearch}>确认搜索</Button>
                </View>
              </View>
            </View>
          )}

          <View className='search-guest-row' onClick={this.handleGuestClick}>
            <Text className='guest-text'>{searchParams.rooms}间房 {searchParams.adults}成人 {searchParams.children}儿童</Text>
            <Text className='arrow'>▼</Text>
          </View>
        </View>

        {showGuestPanel && (
          <View className='drawer-mask' onClick={this.handleGuestClick}>
            <View className='drawer-panel' onClick={(e) => e.stopPropagation()}>
              <View className='drawer-header'>
                <Text className='drawer-title'>选择客房和入住人数</Text>
                <View className='drawer-close' onClick={this.handleGuestClick}>✕</View>
              </View>
              <View className='drawer-content'>
                <View className='guest-row'>
                  <Text className='guest-label'>房间数</Text>
                  <Picker mode='selector' range={[1, 2, 3, 4, 5]} onChange={this.handleRoomsChange}>
                    <View className='guest-picker'>
                      <Text>{searchParams.rooms}间</Text>
                      <Text className='picker-arrow'>▼</Text>
                    </View>
                  </Picker>
                </View>
                <View className='guest-row'>
                  <Text className='guest-label'>成人</Text>
                  <Picker mode='selector' range={[1, 2, 3, 4, 5]} onChange={this.handleAdultsChange}>
                    <View className='guest-picker'>
                      <Text>{searchParams.adults}人</Text>
                      <Text className='picker-arrow'>▼</Text>
                    </View>
                  </Picker>
                </View>
                <View className='guest-row'>
                  <Text className='guest-label'>儿童</Text>
                  <Picker mode='selector' range={[0, 1, 2, 3, 4]} onChange={this.handleChildrenChange}>
                    <View className='guest-picker'>
                      <Text>{searchParams.children}人</Text>
                      <Text className='picker-arrow'>▼</Text>
                    </View>
                  </Picker>
                </View>
              </View>
              <View className='drawer-footer'>
                <Button className='drawer-btn' onClick={this.handleSearch}>完成</Button>
              </View>
            </View>
          </View>
        )}

        <CitySelector
          visible={showCityModal}
          selectedCity={searchParams.city}
          onConfirm={this.handleCitySelect}
          onClose={this.handleCityCancel}
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
          >
            <Text className='bookmark-icon'>⏰</Text>
            <CountdownTimer initialTime={remainingTime} onExpire={this.loadPendingOrder} />
          </View>
        )}

        <ScrollView 
          scrollY 
          className='hotel-container'
          onScrollToLower={this.handleScrollToLower}
          lowerThreshold={100}
        >
          {hotels.length > 0 ? (
            <>
              {hotels.map((hotel) => (
                <View key={hotel.id} className='hotel-card' onClick={() => this.handleHotelClick(hotel.id)}>
                  <View className='hotel-left'>
                    {hotel.coverImage && <Image className='hotel-cover' src={hotel.coverImage} mode='aspectFill' lazyLoad />}
                  </View>
                  <View className='hotel-right'>
                    <View className='hotel-name-row'>
                      <Text className='hotel-name'>{hotel.hotelName}</Text>
                      <View className='hotel-stars'>
                        {this.renderStars(hotel.starLevel)}
                      </View>
                    </View>
                    <Text className='hotel-name-en'>{hotel.hotelNameEn}</Text>
                    <View className='hotel-info'>
                      <View className='hotel-address'>{hotel.address}</View>
                    </View>
                    {hotel.facilities && Array.isArray(hotel.facilities) && hotel.facilities.length > 0 && (
                      <View className='hotel-facilities'>
                        {hotel.facilities.slice(0, 4).map((facility, index) => (
                          <Text key={index} className='facility-item'>{this.getFacilityLabel(facility)}</Text>
                        ))}
                      </View>
                    )}
                    {this.renderPrice(hotel.minPrice)}
                  </View>
                </View>
              ))}
              
              {loadingMore && (
                <>
                  <Skeleton type='card' showContent={true} />
                  <Skeleton type='card' showContent={true} />
                </>
              )}
            </>
          ) : loadingMore ? (
            <>
              <Skeleton type='card' showContent={true} />
              <Skeleton type='card' showContent={true} />
              <Skeleton type='card' showContent={true} />
            </>
          ) : (
            <View className='empty-state'>
              <Text className='empty-text'>暂无酒店数据</Text>
            </View>
          )}

          {loadingMore && (
            <View className='loading-more'>
              <Text className='loading-text'>加载中...</Text>
            </View>
          )}

          {!hasMore && hotels.length > 0 && (
            <View className='no-more'>
              <Text className='no-more-text'>没有更多了</Text>
            </View>
          )}
        </ScrollView>

        <Calendar
          visible={showCalendar}
          startDate={searchParams.checkIn}
          endDate={searchParams.checkOut}
          onConfirm={this.handleCalendarConfirm}
          onClose={this.handleCalendarClose}
        />

      </View>
    )
  }

  renderStars = (starLevel: number) => {
    const stars = []
    for (let i = 0; i < starLevel; i++) {
      stars.push(<Text key={i} className='star'>⭐</Text>)
    }
    return stars
  }

  getFacilityLabel = (facility: string) => {
    const labelMap: { [key: string]: string } = {
      'wifi': '免费 WiFi',
      'parking': '免费停车场',
      'swimming': '游泳池',
      'gym': '健身房',
      'restaurant': '餐厅',
      'spa': 'SPA',
      'bar': '酒吧',
      'coffee': '咖啡厅',
      'breakfast': '免费早餐',
      'laundry': '洗衣服务',
      'dry_cleaning': '干洗服务',
      'ironing': '熨衣服务',
      'shuttle': '班车服务',
      'airport_shuttle': '机场班车',
      'car_rental': '租车服务',
      'bike_rental': '自行车租赁',
      'meeting_room': '会议室',
      'banquet': '宴会厅',
      'conference': '会议中心',
      'business_center': '商务中心',
      'front_24h': '24小时前台',
      'checkin_24h': '24小时入住',
      'luggage_storage': '行李寄存',
      'concierge': '礼宾服务',
      'currency_exchange': '外币兑换',
      'atm': 'ATM取款机',
      'safe': '保险箱',
      'elevator': '电梯',
      'disabled_access': '无障碍设施',
      'wheelchair': '轮椅通道',
      'air_conditioning': '空调',
      'heating': '暖气',
      'mini_bar': '迷你吧',
      'refrigerator': '冰箱',
      'kitchen': '厨房',
      'kitchenette': '小厨房',
      'microwave': '微波炉',
      'toaster': '烤面包机',
      'kettle': '电水壶',
      'cooking': '烹饪设施',
      'dishwasher': '洗碗机',
      'tea_coffee': '茶/咖啡设备',
      'tv': '电视',
      'cable_tv': '有线电视',
      'satellite_tv': '卫星电视',
      'streaming': '流媒体服务',
      'phone': '电话',
      'fax': '传真',
      'printer': '打印机',
      'scanner': '扫描仪',
      'photocopy': '复印服务',
      'internet': '上网服务',
      'wired_internet': '有线网络',
      'computer': '电脑',
      'projector': '投影仪',
      'screen': '投影幕布',
      'whiteboard': '白板',
      'video_conf': '视频会议',
      'audio_visual': '视听设备',
      'hairdryer': '吹风机',
      'bathrobe': '浴袍',
      'slippers': '拖鞋',
      'toiletries': '洗漱用品',
      'towel': '毛巾',
      'bath_towel': '浴巾',
      'shampoo': '洗发水',
      'conditioner': '护发素',
      'body_wash': '沐浴露',
      'soap': '香皂',
      'toothbrush': '牙刷',
      'comb': '梳子',
      'razor': '剃须刀',
      'shaving_cream': '剃须膏',
      'cotton_swabs': '棉签',
      'cotton_balls': '化妆棉',
      'nail_clipper': '指甲刀',
      'sewing_kit': '针线包',
      'shoe_shine': '擦鞋服务',
      'shoe_polish': '鞋油',
      'laundry_bag': '洗衣袋',
      'shopping_bag': '购物袋',
      'umbrella': '雨伞',
      'raincoat': '雨衣',
      'sunscreen': '防晒霜',
      'mosquito_repellent': '驱蚊剂',
      'insect_repellent': '驱虫剂',
      'golf': '高尔夫球场',
      'tennis': '网球场',
      'basketball': '篮球场',
      'volleyball': '排球场',
      'badminton': '羽毛球场',
      'table_tennis': '乒乓球',
      'billiards': '台球',
      'bowling': '保龄球',
      'squash': '壁球',
      'yoga': '瑜伽',
      'pilates': '普拉提',
      'aerobics': '有氧运动',
      'zumba': '尊巴舞',
      'dance': '舞蹈课程',
      'meditation': '冥想',
      'massage': '按摩',
      'facial': '面部护理',
      'body_treatment': '身体护理',
      'manicure': '美甲',
      'pedicure': '足疗',
      'hair_salon': '美发沙龙',
      'beauty_salon': '美容沙龙',
      'steam_room': '蒸汽房',
      'sauna': '桑拿',
      'hot_tub': '热水浴缸',
      'cold_plunge': '冷水池',
      'hydrotherapy': '水疗',
      'aromatherapy': '芳香疗法',
      'reflexology': '足底按摩',
      'acupuncture': '针灸',
      'traditional_medicine': '传统医学',
      'herbal_medicine': '草药治疗',
      'nutritionist': '营养师',
      'personal_trainer': '私人教练',
      'fitness_class': '健身课程',
      'swimming_lesson': '游泳课程',
      'tennis_lesson': '网球课程',
      'golf_lesson': '高尔夫课程',
      'ski_lesson': '滑雪课程',
      'surf_lesson': '冲浪课程',
      'dive_lesson': '潜水课程',
      'kayak_lesson': '皮划艇课程',
      'sail_lesson': '帆船课程',
      'horse_riding': '骑马',
      'hiking': '徒步',
      'biking': '骑行',
      'fishing': '钓鱼',
      'boating': '划船',
      'sailing': '帆船',
      'surfing': '冲浪',
      'diving': '潜水',
      'snorkeling': '浮潜',
      'water_skiing': '水上滑水',
      'jet_ski': '喷气滑雪',
      'parasailing': '帆伞',
      'kiteboarding': '风筝冲浪',
      'windsurfing': '帆板',
      'rafting': '漂流',
      'canoeing': '独木舟',
      'kayaking': '皮划艇',
      'stand_up_paddle': '立桨冲浪',
      'first_aid': '急救包',
      'fire_extinguisher': '灭火器',
      'smoke_detector': '烟雾探测器',
      'carbon_monoxide': '一氧化碳探测器',
      'fire_alarm': '火灾报警器',
      'sprinkler': '喷淋系统',
      'emergency_exit': '紧急出口',
      'emergency_light': '应急照明',
      'security_camera': '监控摄像头',
      'security_guard': '保安',
      'key_card': '房卡',
      'electronic_lock': '电子锁',
      'safe_deposit': '贵重物品保管',
      'room_service': '客房服务',
      'wake_up_call': '叫醒服务',
      'turndown_service': '开夜床服务',
      'housekeeping': '客房清洁',
      'daily_housekeeping': '每日清洁',
      'weekly_housekeeping': '每周清洁',
      'request_cleaning': '按需清洁',
      'bed_change': '换床单',
      'towel_change': '换毛巾',
      'toiletries_replenish': '补充洗漱用品',
      'minibar_replenish': '补充迷你吧',
      'water_replenish': '补充饮用水',
      'newspaper': '报纸',
      'magazine': '杂志',
      'guidebook': '旅游指南',
      'map': '地图',
      'tour_info': '旅游信息',
      'ticket_booking': '票务预订',
      'restaurant_reservation': '餐厅预订',
      'spa_reservation': 'SPA预订',
      'gym_reservation': '健身房预订',
      'pool_reservation': '游泳池预订',
      'court_reservation': '球场预订',
      'family': '亲子',
      'luxury': '豪华',
      'business': '商务',
      'airport': '近机场',
      'subway': '近地铁'
    }
    return labelMap[facility] || facility
  }
}
