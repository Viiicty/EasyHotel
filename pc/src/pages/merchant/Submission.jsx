import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Descriptions, message, Select, Input, Spin, Tabs } from 'antd'
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'

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

function Submission() {
  const [activeTab, setActiveTab] = useState('hotel')
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState({})
  const [hotels, setHotels] = useState({})
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [filters, setFilters] = useState({
    status: '审核中',
    keyword: '',
  })

  const getToken = () => {
    return localStorage.getItem('token')
  }

  const getCurrentUserId = () => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const parsed = JSON.parse(user)
        return parsed.id
      } catch (error) {
        console.error('Error parsing user:', error)
      }
    }
    return null
  }

  const fetchUserById = async (userId) => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/auth/user/${userId}`, {
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
      const response = await fetch(`${API_BASE}/hotel`, {
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
      }
    } catch (error) {
      console.error('Error fetching hotels:', error)
    }
  }

  const fetchHotels = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const currentUserId = getCurrentUserId()
      const response = await fetch(`${API_BASE}/hotel`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch hotels')
      }
      
      const result = await response.json()
      const formattedData = (result.data || [])
        .filter(item => item.merchantId === currentUserId)
        .map(item => ({
        key: item.id,
        id: item.id,
        hotelName: item.nameZh || '未知酒店',
        hotelNameEn: item.nameEn || '',
        type: '酒店信息',
        submitTime: item.createdTime ? new Date(item.createdTime).toLocaleString('zh-CN') : '-',
        submitterId: item.createdBy,
        submitter: item.createdBy || '-',
        status: item.status === 'DRAFT' ? '草稿' : item.status === 'PENDING' ? '审核中' : item.status === 'APPROVED' ? '已通过' : item.status === 'REJECTED' ? '已驳回' : item.status,
        auditorId: item.updatedBy,
        auditor: item.updatedBy || '-',
        rejectReason: item.rejectReason || '-',
        cityCode: item.cityCode,
        starLevel: item.starLevel,
        address: item.address,
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
      
      const userIds = formattedData.flatMap(item => [item.submitterId, item.auditorId])
      fetchUsers(userIds)
    } catch (error) {
      console.error('Error fetching hotels:', error)
      message.error('获取提交记录失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoomTypes = async () => {
    setLoading(true)
    try {
      await fetchHotelsMap()
      
      const token = getToken()
      const currentUserId = getCurrentUserId()
      const response = await fetch(`${API_BASE}/room-type`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch room types')
      }
      
      const result = await response.json()
      const formattedData = (result.data || [])
        .filter(item => item.createdBy === currentUserId)
        .map(item => ({
        key: item.id,
        id: item.id,
        hotelId: item.hotelId,
        hotelName: hotels[item.hotelId] || '未知酒店',
        roomTypeName: item.name || '未知房型',
        bedType: item.bedType || '-',
        breakfast: item.breakfast || '-',
        areaSqm: item.areaSqm || '-',
        maxGuests: item.maxGuests || '-',
        type: '房型管理',
        submitTime: item.createdTime ? new Date(item.createdTime).toLocaleString('zh-CN') : '-',
        submitterId: item.createdBy,
        submitter: item.createdBy || '-',
        status: item.status === 'DRAFT' ? '草稿' : item.status === 'PENDING' ? '审核中' : item.status === 'APPROVED' ? '已通过' : item.status === 'REJECTED' ? '已驳回' : item.status,
        auditorId: item.updatedBy,
        auditor: item.updatedBy || '-',
        rejectReason: item.rejectReason || '-',
      }))
      
      setDataSource(formattedData)
      
      const userIds = formattedData.flatMap(item => [item.submitterId, item.auditorId])
      fetchUsers(userIds)
    } catch (error) {
      console.error('Error fetching room types:', error)
      message.error('获取房型记录失败')
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

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const getStatusColor = (status) => {
    switch (status) {
      case '草稿':
        return 'default'
      case '审核中':
        return 'processing'
      case '已通过':
        return 'success'
      case '已驳回':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case '草稿':
        return <ClockCircleOutlined />
      case '审核中':
        return <ClockCircleOutlined />
      case '已通过':
        return <CheckCircleOutlined />
      case '已驳回':
        return <CloseCircleOutlined />
      default:
        return null
    }
  }

  const hotelColumns = [
    {
      title: '酒店名称',
      dataIndex: 'hotelName',
      key: 'hotelName',
      width: 200,
    },
    {
      title: '提交类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 180,
    },
    {
      title: '提交人',
      dataIndex: 'submitter',
      key: 'submitter',
      width: 100,
      render: (_, record) => users[record.submitterId] || record.submitter,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: '审核人',
      dataIndex: 'auditor',
      key: 'auditor',
      width: 100,
      render: (_, record) => users[record.auditorId] || record.auditor,
    },
    {
      title: '驳回原因',
      dataIndex: 'rejectReason',
      key: 'rejectReason',
      width: 200,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>
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
      title: '提交类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 180,
    },
    {
      title: '提交人',
      dataIndex: 'submitter',
      key: 'submitter',
      width: 100,
      render: (_, record) => users[record.submitterId] || record.submitter,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: '审核人',
      dataIndex: 'auditor',
      key: 'auditor',
      width: 100,
      render: (_, record) => users[record.auditorId] || record.auditor,
    },
    {
      title: '驳回原因',
      dataIndex: 'rejectReason',
      key: 'rejectReason',
      width: 200,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>
      ),
    },
  ]

  const getColumns = () => {
    if (activeTab === 'hotel') return hotelColumns
    if (activeTab === 'roomtype') return roomTypeColumns
    return hotelColumns
  }

  const handleViewDetail = (record) => {
    setSelectedRecord(record)
    setIsDetailModalOpen(true)
  }

  const handleResubmit = () => {
    message.info('重新提交功能开发中')
    setIsDetailModalOpen(false)
  }

  const filteredDataSource = dataSource.filter(item => {
    if (filters.status && item.status !== filters.status) return false
    if (filters.keyword && !item.hotelName.includes(filters.keyword)) return false
    return true
  })

  return (
    <div>
      <Card title="提交记录" bordered={false}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space wrap>
            <Input
              placeholder="搜索酒店名称"
              style={{ width: 200 }}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
            <Select
              placeholder="审核状态"
              style={{ width: 150 }}
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Select.Option value="草稿">草稿</Select.Option>
              <Select.Option value="审核中">审核中</Select.Option>
              <Select.Option value="已通过">已通过</Select.Option>
              <Select.Option value="已驳回">已驳回</Select.Option>
            </Select>
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
                scroll={{ x: 1200 }}
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
                scroll={{ x: 1200 }}
              />
            </TabPane>
          </Tabs>
        </Space>
      </Card>

      <Modal
        title="提交详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={800}
        footer={
          selectedRecord?.status === '已驳回' ? (
            <Space>
              <Button onClick={() => setIsDetailModalOpen(false)}>关闭</Button>
              <Button type="primary" onClick={handleResubmit}>
                重新提交
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setIsDetailModalOpen(false)}>关闭</Button>
          )
        }
      >
        {selectedRecord && activeTab === 'hotel' && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="酒店名称" span={2}>
              {selectedRecord.hotelName}
            </Descriptions.Item>
            <Descriptions.Item label="酒店英文名">
              {selectedRecord.hotelNameEn}
            </Descriptions.Item>
            <Descriptions.Item label="提交类型">
              {selectedRecord.type}
            </Descriptions.Item>
            <Descriptions.Item label="提交时间">
              {selectedRecord.submitTime}
            </Descriptions.Item>
            <Descriptions.Item label="提交人">
              {users[selectedRecord.submitterId] || selectedRecord.submitter}
            </Descriptions.Item>
            <Descriptions.Item label="审核状态">
              <Tag icon={getStatusIcon(selectedRecord.status)} color={getStatusColor(selectedRecord.status)}>
                {selectedRecord.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="审核人">
              {users[selectedRecord.auditorId] || selectedRecord.auditor}
            </Descriptions.Item>
            <Descriptions.Item label="驳回原因" span={2}>
              {selectedRecord.rejectReason}
            </Descriptions.Item>
            <Descriptions.Item label="城市代码">
              {selectedRecord.cityCode}
            </Descriptions.Item>
            <Descriptions.Item label="星级">
              {selectedRecord.starLevel}
            </Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>
              {selectedRecord.address}
            </Descriptions.Item>
            <Descriptions.Item label="酒店设施" span={2}>
              {selectedRecord.facilities && selectedRecord.facilities.length > 0 
                ? selectedRecord.facilities.map(f => getFacilityLabel(f)).join(', ') 
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="快捷标签" span={2}>
              {selectedRecord.tags && selectedRecord.tags.length > 0 
                ? selectedRecord.tags.map(t => getTagLabel(t)).join(', ') 
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="入住时间">
              {selectedRecord.checkInTime}
            </Descriptions.Item>
            <Descriptions.Item label="离店时间">
              {selectedRecord.checkOutTime}
            </Descriptions.Item>
            <Descriptions.Item label="取消政策">
              {selectedRecord.cancelPolicy}
            </Descriptions.Item>
            <Descriptions.Item label="修改政策">
              {selectedRecord.changePolicy}
            </Descriptions.Item>
            <Descriptions.Item label="加床政策">
              {selectedRecord.extraBedPolicy}
            </Descriptions.Item>
          </Descriptions>
        )}
        {selectedRecord && activeTab === 'roomtype' && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="酒店名称" span={2}>
              {selectedRecord.hotelName}
            </Descriptions.Item>
            <Descriptions.Item label="房型名称" span={2}>
              {selectedRecord.roomTypeName}
            </Descriptions.Item>
            <Descriptions.Item label="床型">
              {selectedRecord.bedType}
            </Descriptions.Item>
            <Descriptions.Item label="早餐">
              {selectedRecord.breakfast}
            </Descriptions.Item>
            <Descriptions.Item label="面积">
              {selectedRecord.areaSqm}
            </Descriptions.Item>
            <Descriptions.Item label="最多入住人数">
              {selectedRecord.maxGuests}
            </Descriptions.Item>
            <Descriptions.Item label="提交时间">
              {selectedRecord.submitTime}
            </Descriptions.Item>
            <Descriptions.Item label="提交人">
              {users[selectedRecord.submitterId] || selectedRecord.submitter}
            </Descriptions.Item>
            <Descriptions.Item label="审核状态">
              <Tag icon={getStatusIcon(selectedRecord.status)} color={getStatusColor(selectedRecord.status)}>
                {selectedRecord.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="审核人">
              {users[selectedRecord.auditorId] || selectedRecord.auditor}
            </Descriptions.Item>
            <Descriptions.Item label="驳回原因" span={2}>
              {selectedRecord.rejectReason}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default Submission
