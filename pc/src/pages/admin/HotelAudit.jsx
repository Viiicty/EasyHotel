import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, message, Descriptions, Drawer, Row, Col, Tabs, Image } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const API_BASE = '/api'
const { TabPane } = Tabs

const facilityLabelMap = {
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
  'court_reservation': '球场预订'
}

const tagLabelMap = {
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
  'family': '亲子酒店',
  'luxury': '豪华酒店',
  'business': '商务酒店',
  'airport': '近机场',
  'subway': '近地铁',
  'love': '适合情侣',
  'car': '接送机服务',
  'elderly_friendly': '老年友好',
  'child_friendly': '儿童友好',
  'teen_friendly': '青少年友好',
  'adult_only': '成人专用',
  'women_only': '女性专用',
  'men_only': '男性专用',
  'lgbt_friendly': 'LGBT友好',
  'honeymoon': '蜜月酒店',
  'wedding': '婚礼场地',
  'anniversary': '纪念日',
  'birthday': '生日派对',
  'bachelor_party': '单身派对',
  'bachelorette_party': '新娘派对',
  'reunion': '家庭聚会',
  'corporate_event': '企业活动',
  'team_building': '团队建设',
  'retreat': '静修'
}

const getFacilityLabel = (facility) => {
  return facilityLabelMap[facility] || facility
}

const getTagLabel = (tag) => {
  return tagLabelMap[tag] || tag
}

const getCancelPolicyLabel = (policy) => {
  const policyMap = {
    'free': '免费取消',
    '24h': '入住前24小时可取消',
    '48h': '入住前48小时可取消',
    'none': '不可取消'
  }
  return policyMap[policy] || policy
}

const getChangePolicyLabel = (policy) => {
  const policyMap = {
    'free': '免费修改',
    '24h': '入住前24小时可修改',
    '48h': '入住前48小时可修改',
    'none': '不可修改'
  }
  return policyMap[policy] || policy
}

const getExtraBedPolicyLabel = (policy) => {
  const policyMap = {
    'allow': '允许免费加床',
    'charge': '允许收费加床',
    'none': '不允许加床'
  }
  return policyMap[policy] || policy
}

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  return dayjs(timeStr).format('HH:mm')
}

function HotelAudit() {
  const [activeTab, setActiveTab] = useState('hotel')
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [roomTypePictures, setRoomTypePictures] = useState([])
  const [hotelCovers, setHotelCovers] = useState({})
  const [auditForm] = Form.useForm()
  const [users, setUsers] = useState({})
  const [hotels, setHotels] = useState({})
  const [filters, setFilters] = useState({
    status: '待审核',
    city: '',
    keyword: '',
  })

  const getToken = () => {
    return localStorage.getItem('token')
  }

  const fetchUserById = async (userId) => {
    try { 
      const token = getToken()
      const response = await fetch(`/api/auth/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        return result.data
      }
      return null
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  const fetchUsers = async (userIds) => {
    const uniqueIds = [...new Set(userIds.filter(id => id))]
    const userMap = {}
    
    for (const userId of uniqueIds) {
      const user = await fetchUserById(userId)
      if (user) {
        userMap[userId] = user.name || user.email || '-'
      }
    }
    
    setUsers(userMap)
  }

  const fetchHotelsMap = async () => {
    try {
      const token = getToken()
      const response = await fetch(`/api/hotel`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        const hotelMap = {}
        ;(result.data || []).forEach(hotel => {
          hotelMap[hotel.id] = hotel.nameZh || hotel.name || '未知酒店'
        })
        setHotels(hotelMap)
        return hotelMap
      }
      return {}
    } catch (error) {
      console.error('Error fetching hotels:', error)
      return {}
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab, filters.status])

  const fetchHotels = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const response = await fetch(`/api/hotel`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const { data: result } = await response.json()
        const formattedData = (result || []).map(item => ({
          key: item.id,
          id: item.id,
          nameZh: item.nameZh || '未知酒店',
          nameEn: item.nameEn || '',
          cityCode: item.cityCode,
          starLevel: item.starLevel,
          address: item.address,
          createdAt: item.createdTime ? new Date(item.createdTime).toLocaleString('zh-CN') : '-',
          createdBy: item.createdBy,
          status:  item.status === 'PENDING' ? '待审核' : item.status === 'APPROVED' ? '已通过' : item.status === 'REJECTED' ? '已驳回' : item.status,
          reviewedBy: item.updatedBy,
          rejectReason: item.rejectReason || '-',
          facilities: (() => {
            const facilities = item.facilities || []
            return Array.isArray(facilities) ? facilities : (typeof facilities === 'string' ? facilities.split(',') : [])
          })(),
          tags: (() => {
            const tags = item.tags || []
            return Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',') : [])
          })(),
          checkInTime: item.checkInTime,
          checkOutTime: item.checkOutTime,
          cancelPolicy: item.cancelPolicy,
          changePolicy: item.changePolicy,
          extraBedPolicy: item.extraBedPolicy,
        }))
        setDataSource(formattedData)
        
        const userIds = formattedData.flatMap(item => [item.createdBy, item.reviewedBy])
        fetchUsers(userIds)
        
        const hotelIds = formattedData.map(item => item.id)
        fetchHotelCovers(hotelIds)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', response.status, errorData)
        message.error(errorData.message || '获取酒店列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch hotels:', error)
      message.error('网络错误，请检查后端服务是否启动')
    } finally {
      setLoading(false)
    }
  }

  const fetchsubmission = async (id, tab) => {
    try {
      const token = getToken()
      let url = ''
      
      if (tab === 'hotel') {
        url = `/api/hotel-submission/hotel/${id}`
      } else if (tab === 'roomtype') {
        url = `/api/hotel-submission/roomtype/${id}`
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const { data } = await response.json()
        setSelectedSubmission(data)
      }
    } catch (error) {
      console.error('Failed to fetch submission:', error)
      message.error('网络错误，请检查后端服务是否启动')
    }
  }

  const fetchHotelCovers = async (hotelIds) => {
    try {
      const token = getToken()
      const coverMap = {}
      
      for (const hotelId of hotelIds) {
        const response = await fetch(`/api/hotel-cover/hotel/${hotelId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          const covers = result.data || result || []
          if (covers.length > 0) {
            coverMap[hotelId] = covers[0].url
          }
        }
      }
      
      setHotelCovers(coverMap)
    } catch (error) {
      console.error('Failed to fetch hotel covers:', error)
    }
  }

  const fetchRoomTypes = async () => {
    setLoading(true)
    try {
      const hotelMap = await fetchHotelsMap()
      
      const token = getToken()
      const response = await fetch(`/api/room-type`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        const formattedData = (result.data || []).map(item => ({
          key: item.id,
          id: item.id,
          hotelId: item.hotelId,
          hotelName: hotelMap[item.hotelId] || '未知酒店',
          name: item.name || '未知房型',
          bedType: item.bedType || '-',
          breakfast: item.breakfast || '-',
          areaSqm: item.areaSqm || '-',
          maxGuests: item.maxGuests || '-',
          createdAt: item.createdTime ? new Date(item.createdTime).toLocaleString('zh-CN') : '-',
          createdBy: item.createdBy,
          status: item.status === 'DRAFT' ? '草稿' : item.status === 'PENDING' ? '待审核' : item.status === 'APPROVED' ? '已通过' : item.status === 'REJECTED' ? '已驳回': item.status,
          reviewedBy: item.updatedBy,
          rejectReason: item.rejectReason || '-',
        }))
        
        setDataSource(formattedData)
        
        const userIds = formattedData.flatMap(item => [item.createdBy, item.reviewedBy])
        fetchUsers(userIds)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', response.status, errorData)
        message.error(errorData.message || '获取房型列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch room types:', error)
      message.error('网络错误，请检查后端服务是否启动')
    } finally {
      setLoading(false)
    }
  }

  const fetchData = () => {
    if (activeTab === 'hotel') {
      fetchHotels()
    } else if (activeTab === 'roomtype') {
      fetchRoomTypes()
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
      case 'pending':
        return 'processing'
      case 'APPROVED':
      case 'approved':
        return 'success'
      case 'REJECTED':
      case 'rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
      case 'pending':
        return '待审核'
      case 'APPROVED':
      case 'approved':
      case 'ACCEPT':
        return '已通过'
      case 'REJECTED':
      case 'rejected':
      case 'REJECT':
        return '已驳回'
      case 'DRAFT':
      case 'draft':
        return '草稿'
      default:
        return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
      case 'pending':
        return null
      case 'APPROVED':
      case 'approved':
      case 'ACCEPT':
        return <CheckCircleOutlined />
      case 'REJECTED':
      case 'rejected':
      case 'REJECT':
        return <CloseCircleOutlined />
      default:
        return null
    }
  }

  const hotelColumns = [
    {
      title: '酒店名称',
      dataIndex: 'nameZh',
      key: 'nameZh',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.nameEn}</div>
        </div>
      ),
    },
    {
      title: '城市',
      dataIndex: 'cityCode',
      key: 'cityCode',
      width: 100,
      render: (cityCode) => {
        const cityMap = {
          'beijing': '北京',
          'shanghai': '上海',
          'hangzhou': '杭州',
          'guangzhou': '广州',
        }
        return cityMap[cityCode] || cityCode
      },
    },
    {
      title: '星级',
      dataIndex: 'starLevel',
      key: 'starLevel',
      width: 80,
      render: (level) => {
        if (!level) return '-'
        const stars = []
        for (let i = 0; i < level; i++) {
          stars.push('★')
        }
        return <span style={{ color: '#faad14' }}>{stars.join('')}</span>
      },
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '审核人',
      dataIndex: 'reviewedBy',
      key: 'reviewedBy',
      width: 100,
      render: (_, record) => users[record.reviewedBy] || record.reviewedBy || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
          {record.status === '待审核' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleAudit(record)}
            >
              审核
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const roomTypeColumns = [
    {
      title: '酒店名称',
      dataIndex: 'hotelName',
      key: 'hotelName',
      width: 200,
    },
    {
      title: '房型名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '床型',
      dataIndex: 'bedType',
      key: 'bedType',
      width: 100,
    },
    {
      title: '早餐',
      dataIndex: 'breakfast',
      key: 'breakfast',
      width: 100,
    },
    {
      title: '面积',
      dataIndex: 'areaSqm',
      key: 'areaSqm',
      width: 100,
    },
    {
      title: '最多入住',
      dataIndex: 'maxGuests',
      key: 'maxGuests',
      width: 100,
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '审核人',
      dataIndex: 'reviewedBy',
      key: 'reviewedBy',
      width: 100,
      render: (_, record) => users[record.reviewedBy] || record.reviewedBy || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
          {record.status === '待审核' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleAudit(record)}
            >
              审核
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const getColumns = () => {
    if (activeTab === 'hotel') return hotelColumns
    if (activeTab === 'roomtype') return roomTypeColumns
    return hotelColumns
  }

  const handleViewDetail = async (record) => {
    setSelectedRecord(record)
    console.log("record：", record)
    fetchsubmission(record.id, activeTab)
    
    if (activeTab === 'roomtype') {
      try {
        const token = getToken()
        console.log('Fetching room type pictures for:', record.id)
        const response = await fetch(`/api/roomtype-picture/room-type/${record.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        console.log('Response status:', response.status)
        if (response.ok) {
          const result = await response.json()
          console.log('Room type pictures result:', result)
          const pictures = result.data || []
          console.log('Setting roomTypePictures:', pictures)
          setRoomTypePictures(pictures)
        } else {
          console.error('Failed to fetch room type pictures, status:', response.status)
          setRoomTypePictures([])
        }
      } catch (error) {
        console.error('Failed to fetch room type pictures:', error)
        setRoomTypePictures([])
      }
    } else {
      setRoomTypePictures([])
    }
    
    const userIds = [record.createdBy, record.reviewedBy].filter(id => id)
    await fetchUsers(userIds)
    
    setIsDetailDrawerOpen(true)
  }

  const handleAudit = (record) => {
    setSelectedRecord(record)
    auditForm.resetFields()
    setIsAuditModalOpen(true)
  }

  const handleAuditSubmit = async (values) => {
    try {
      const token = getToken()
      let url = ''
      let data = {}

      if (activeTab === 'hotel') {
        url = `/api/hotel/audit/${selectedRecord.id}`
        data = {
          status: values.action === 'approve' ? 'APPROVED' : 'REJECTED',
          rejectReason: values.reason || '',
        }
      } else if (activeTab === 'roomtype') {
        url = `/api/room-type/audit/${selectedRecord.id}`
        data = {
          status: values.action === 'approve' ? 'APPROVED' : 'REJECTED',
          rejectReason: values.reason || '',
        }
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        message.success(values.action === 'approve' ? '审核通过' : '审核驳回')
        setIsAuditModalOpen(false)
        fetchData()
      } else {
        const errorData = await response.json().catch(() => ({}))
        message.error(errorData.message || '审核失败')
      }
    } catch (error) {
      console.error('Audit failed:', error)
      message.error('网络错误，审核失败')
    }
  }

  const filteredDataSource = dataSource.filter(item => {
    if (filters.status && item.status !== filters.status) return false
    if (filters.city && activeTab === 'hotel' && item.cityCode !== filters.city) return false
    if (filters.keyword) {
      if (activeTab === 'hotel') {
        console.log(item)
        if (!item.nameZh?.includes(filters.keyword) && !item.nameEn?.includes(filters.keyword)) return false
      } else if (activeTab === 'roomtype') {
        if (!item.name?.includes(filters.keyword) && !item.hotelName?.includes(filters.keyword)) return false
      } else if (activeTab === 'roomprice') {
        if (!item.ratePlanId?.includes(filters.keyword)) return false
      }
    }
    return true
  })

  return (
    <div>
      <Card title="审核中心" bordered={false}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space wrap>
            <Input
              placeholder={activeTab === 'hotel' ? '搜索酒店名称/商户' : activeTab === 'roomtype' ? '搜索房型名称/酒店' : '搜索价格方案ID'}
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
            <Select
              placeholder="审核状态"
              style={{ width: 150 }}
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Select.Option value="待审核">待审核</Select.Option>
              <Select.Option value="已通过">已通过</Select.Option>
              <Select.Option value="已驳回">已驳回</Select.Option>
            </Select>
            {activeTab === 'hotel' && (
              <Select
                placeholder="城市"
                style={{ width: 150 }}
                allowClear
                onChange={(value) => setFilters({ ...filters, city: value })}
              >
                <Select.Option value="beijing">北京</Select.Option>
                <Select.Option value="shanghai">上海</Select.Option>
                <Select.Option value="hangzhou">杭州</Select.Option>
                <Select.Option value="guangzhou">广州</Select.Option>
              </Select>
            )}
          </Space>

          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="酒店信息" key="hotel">
              <Table
                dataSource={filteredDataSource}
                columns={getColumns()}
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条`,
                }}
                scroll={{ x: 1400 }}
              />
            </TabPane>
            <TabPane tab="房型管理" key="roomtype">
              <Table
                dataSource={filteredDataSource}
                columns={getColumns()}
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条`,
                }}
                scroll={{ x: 1400 }}
              />
            </TabPane>
          </Tabs>
        </Space>
      </Card>

      <Drawer
        title="详情"
        placement="right"
        width={800}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
      >
        {selectedRecord && activeTab === 'hotel' && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="基础信息" bordered={false}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="酒店名称（中文）" span={2}>
                  {selectedRecord.nameZh}
                </Descriptions.Item>
                <Descriptions.Item label="酒店名称（英文）" span={2}>
                  {selectedRecord.nameEn}
                </Descriptions.Item>
                <Descriptions.Item label="城市">
                  {(() => {
                    const cityMap = {
                      'beijing': '北京',
                      'shanghai': '上海',
                      'hangzhou': '杭州',
                      'guangzhou': '广州',
                    }
                    return cityMap[selectedRecord.cityCode] || selectedRecord.cityCode
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="星级">
                  {selectedRecord.starLevel} 星级
                </Descriptions.Item>
                <Descriptions.Item label="酒店封面" span={2}>
                  {hotelCovers[selectedRecord.id] ? (
                    <img 
                      src={`${API_BASE}/upload/hotelcover/${hotelCovers[selectedRecord.id]}`} 
                      alt="酒店封面" 
                      style={{ 
                        width: 200, 
                        height: 150, 
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }} 
                    />
                  ) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="提交时间">
                  {selectedRecord.createdAt}
                </Descriptions.Item>
                <Descriptions.Item label="审核状态" span={2}>
                  <Tag icon={getStatusIcon(selectedRecord.status)} color={getStatusColor(selectedRecord.status)}>
                    {getStatusText(selectedRecord.status)}
                  </Tag>
                </Descriptions.Item>
        
              </Descriptions>
            </Card>

            <Card title="提交内容快照" bordered={false}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="地址">
                  {selectedRecord.address || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="酒店设施">
                  {selectedRecord.facilities && selectedRecord.facilities.length > 0 
                    ? selectedRecord.facilities.map(f => getFacilityLabel(f)).join(', ') 
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="快捷标签">
                  {selectedRecord.tags && selectedRecord.tags.length > 0 
                    ? selectedRecord.tags.map(t => getTagLabel(t)).join(', ') 
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="入住时间">
                  {formatTime(selectedRecord.checkInTime)}
                </Descriptions.Item>
                <Descriptions.Item label="离店时间">
                  {formatTime(selectedRecord.checkOutTime)}
                </Descriptions.Item>
                <Descriptions.Item label="取消政策">
                  {getCancelPolicyLabel(selectedRecord.cancelPolicy) || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="修改政策">
                  {getChangePolicyLabel(selectedRecord.changePolicy) || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="加床政策">
                  {getExtraBedPolicyLabel(selectedRecord.extraBedPolicy) || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="审核信息" bordered={false}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="审核人">
                  {users[selectedSubmission?.reviewedBy] || selectedRecord?.reviewedBy || '-'}
                </Descriptions.Item>
                {selectedSubmission?.status === 'REJECTED' && (
                  <Descriptions.Item label="驳回原因">
                    {selectedSubmission?.rejectReason}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Space>
        )}
        {selectedRecord && activeTab === 'roomtype' && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="房型信息" bordered={false}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="酒店名称" span={2}>
                  {selectedRecord.hotelName}
                </Descriptions.Item>
                <Descriptions.Item label="房型名称" span={2}>
                  {selectedRecord.name}
                </Descriptions.Item>
                <Descriptions.Item label="床型">
                  {selectedRecord.bedType}
                </Descriptions.Item>
                <Descriptions.Item label="早餐">
                  {selectedRecord.breakfast}
                </Descriptions.Item>
                <Descriptions.Item label="面积(㎡)">
                  {selectedRecord.areaSqm}
                </Descriptions.Item>
                <Descriptions.Item label="最多入住人数">
                  {selectedRecord.maxGuests}
                </Descriptions.Item>
                <Descriptions.Item label="提交时间">
                  {selectedRecord.createdAt}
                </Descriptions.Item>
                <Descriptions.Item label="审核状态">
                  <Tag icon={getStatusIcon(selectedRecord.status)} color={getStatusColor(selectedRecord.status)}>
                    {getStatusText(selectedRecord.status)}
                  </Tag>
                </Descriptions.Item>
                {selectedRecord.status === '已驳回' && (
                  <Descriptions.Item label="驳回原因" span={2}>
                    {selectedRecord.rejectReason}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card title="房型图片" bordered={false}>
              {console.log('Rendering roomTypePictures:', roomTypePictures, 'length:', roomTypePictures.length)}
              {roomTypePictures.length > 0 ? (
                <Image.PreviewGroup>
                  <Space wrap>
                    {roomTypePictures.map((pic, index) => (
                      <Image
                        key={pic.id || index}
                        width={120}
                        height={120}
                        src={`/api/upload/roompicture/${pic.url}`}
                        alt={`房型图片${index + 1}`}
                        style={{ objectFit: 'cover' }}
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              ) : (
                <div style={{ color: '#999', padding: '20px', textAlign: 'center' }}>
                  暂无房型图片
                </div>
              )}
            </Card>

            <Card title="审核信息" bordered={false}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="审核人">
                  {users[selectedSubmission?.reviewedBy] || selectedRecord?.reviewedBy || '-'}
                </Descriptions.Item>
                {selectedSubmission?.status === 'REJECTED' && (
                  <Descriptions.Item label="驳回原因">
                    {selectedSubmission?.rejectReason}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Space>
        )}
      </Drawer>

      <Modal
        title="审核"
        open={isAuditModalOpen}
        onCancel={() => setIsAuditModalOpen(false)}
        width={600}
        footer={null}
      >
        <Form
          form={auditForm}
          layout="vertical"
          onFinish={handleAuditSubmit}
        >
          <Form.Item
            label={activeTab === 'hotel' ? '酒店名称' : activeTab === 'roomtype' ? '房型名称' : '价格方案ID'}
          >
            <Input value={activeTab === 'hotel' ? selectedRecord?.nameZh : activeTab === 'roomtype' ? selectedRecord?.name : selectedRecord?.ratePlanId} disabled />
          </Form.Item>

          <Form.Item
            label="审核结果"
            name="action"
            rules={[{ required: true, message: '请选择审核结果' }]}
          >
            <Select placeholder="请选择审核结果">
              <Select.Option value="approve">
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>通过</span>
                </Space>
              </Select.Option>
              <Select.Option value="reject">
                <Space>
                  <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  <span>驳回</span>
                </Space>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.action !== currentValues.action}>
            {({ getFieldValue }) => {
              const action = getFieldValue('action')
              return action === 'reject' ? (
                <Form.Item
                  label="驳回原因"
                  name="reason"
                  rules={[{ required: true, message: '请输入驳回原因' }]}
                >
                  <Input.TextArea rows={4} placeholder="请输入驳回原因（200字以内）" maxLength={200} showCount />
                </Form.Item>
              ) : null
            }}
          </Form.Item>

          <Form.Item
            label="审核备注"
            name="remark"
          >
            <Input.TextArea rows={3} placeholder="请输入审核备注（可选）" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsAuditModalOpen(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确认提交
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default HotelAudit
