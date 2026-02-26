import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, List, Tag, Space, Badge, Spin } from 'antd'
import {
  ApartmentOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const API_BASE = '/api'

function Overview() {
  const navigate = useNavigate()
  const [todayOrderCount, setTodayOrderCount] = useState(0)
  const [totalNights, setTotalNights] = useState(0)
  const [todayGMV, setTodayGMV] = useState(0)
  const [last7DaysOrderCount, setLast7DaysOrderCount] = useState(0)
  const [last7DaysNights, setLast7DaysNights] = useState(0)
  const [pendingOrders, setPendingOrders] = useState([])
  const [rejectedSubmissions, setRejectedSubmissions] = useState([])
  const [loading, setLoading] = useState(false)

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

  const fetchTodayOrderCount = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const currentUserId = getCurrentUserId()
      const response = await fetch(`${API_BASE}/booking-order/merchant/${currentUserId}/today-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Today order count:', result)
        setTodayOrderCount(result.data?.count || 0)
      }
    } catch (error) {
      console.error('Error fetching today order count:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTotalNights = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const currentUserId = getCurrentUserId()
      const response = await fetch(`${API_BASE}/booking-order/merchant/${currentUserId}/total-nights`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Total nights:', result)
        setTotalNights(result.data?.totalNights || 0)
      }
    } catch (error) {
      console.error('Error fetching total nights:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayGMV = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const currentUserId = getCurrentUserId()
      const response = await fetch(`${API_BASE}/booking-order/merchant/${currentUserId}/today-gmv`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Today GMV:', result)
        setTodayGMV(result.data?.totalGMV || 0)
      }
    } catch (error) {
      console.error('Error fetching today GMV:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLast7DaysOrderCount = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const currentUserId = getCurrentUserId()
      const response = await fetch(`${API_BASE}/booking-order/merchant/${currentUserId}/last7days-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setLast7DaysOrderCount(result.data?.count || 0)
      }
    } catch (error) {
      console.error('Error fetching last 7 days order count:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLast7DaysNights = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const currentUserId = getCurrentUserId()
      const response = await fetch(`${API_BASE}/booking-order/merchant/${currentUserId}/last7days-nights`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setLast7DaysNights(result.data?.totalNights || 0)
      }
    } catch (error) {
      console.error('Error fetching last 7 days nights:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingOrders = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const currentUserId = getCurrentUserId()
      const response = await fetch(`${API_BASE}/booking-order/merchant/${currentUserId}/pending-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setPendingOrders(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRejectedSubmissions = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const currentUserId = getCurrentUserId()
      console.log('Fetching rejected submissions for merchant:', currentUserId)
      const response = await fetch(`${API_BASE}/hotel-submission/merchant/${currentUserId}/rejected`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Response status:', response.status)
      if (response.ok) {
        const result = await response.json()
        console.log('Rejected submissions:', result.data)
        setRejectedSubmissions(result.data || [])
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch rejected submissions:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error fetching rejected submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodayOrderCount()
    fetchTotalNights()
    fetchTodayGMV()
    fetchLast7DaysOrderCount()
    fetchLast7DaysNights()
    fetchPendingOrders()
    fetchRejectedSubmissions()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case '审核中':
        return 'processing'
      case '已驳回':
        return 'error'
      case '已通过':
        return 'success'
      case 'PAID':
        return 'warning'
      case 'CONFIRMED':
        return 'processing'
      case 'CANCELLED':
        return 'default'
      case 'COMPLETED':
        return 'success'
      default:
        return 'default'
    }
  }

  const formatOrderTime = (date) => {
    if (!date) return '-'
    const now = new Date()
    const orderDate = new Date(date)
    const diffMs = now - orderDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return orderDate.toLocaleDateString('zh-CN')
  }

  const handleViewOrder = (orderId) => {
    navigate('/merchant/orders?status=PAID')
  }

  const handleViewSubmission = (submissionId) => {
    navigate('/merchant/submission')
  }

  const getHotelName = (item) => {
    if (item.hotel?.nameZh) {
      return item.hotel.nameZh
    }
    if (item.roomtype?.hotel?.nameZh) {
      return item.roomtype.hotel.nameZh
    }
    return '未知酒店'
  }

  const getSubmissionType = (item) => {
    if (item.hotelId && !item.roomtypeId) {
      return '酒店信息'
    }
    if (item.roomtypeId && !item.hotelId) {
      return '房型管理'
    }
    return '提交记录'
  }

  const combinedItems = [
    ...pendingOrders.map(item => ({
      ...item,
      type: 'order',
      tag: '酒店预订',
      tagColor: 'blue',
      hotelName: item.hotel?.nameZh || '未知酒店',
      time: item.createdTime,
    })),
    ...rejectedSubmissions.map(item => ({
      ...item,
      type: 'submission',
      tag: '审核驳回',
      tagColor: 'red',
      hotelName: getHotelName(item),
      time: item.updatedTime,
    })),
  ].sort((a, b) => {
    const timeA = new Date(a.time).getTime()
    const timeB = new Date(b.time).getTime()
    return timeB - timeA
  }).slice(0, 6)

  console.log('Combined items:', combinedItems)
  console.log('Pending orders:', pendingOrders)
  console.log('Rejected submissions:', rejectedSubmissions)

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="今日概览" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="订单数"
                  value={todayOrderCount}
                  prefix={<ApartmentOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                  loading={loading}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="间夜数"
                  value={totalNights}
                  valueStyle={{ color: '#cf1322' }}
                  loading={loading}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="GMV"
                  value={todayGMV}
                  prefix="¥"
                  precision={2}
                  valueStyle={{ color: '#1890ff' }}
                  loading={loading}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24} style={{ marginTop: '24px' }}>
          <Card title="近7天趋势" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="总订单"
                  value={last7DaysOrderCount}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                  loading={loading}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="总间夜"
                  value={last7DaysNights}
                  valueStyle={{ color: '#cf1322' }}
                  loading={loading}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="待办事项" bordered={false} style={{ height: '100%' }}>
            <List
              dataSource={combinedItems}
              style={{ height: 400, overflowY: 'auto' }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a key="view" style={{ fontSize: '14px' }} onClick={() => item.type === 'order' ? handleViewOrder(item.id) : handleViewSubmission(item.id)}>
                      查看 <ArrowRightOutlined />
                    </a>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Badge status={getStatusColor(item.status)} />}
                    title={
                      <Space>
                        <span>{item.hotelName}</span>
                        <Tag color={item.tagColor}>{item.tag}</Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <ClockCircleOutlined style={{ fontSize: '12px', color: '#999' }} />
                        <span style={{ fontSize: '14px', color: '#666' }}>{formatOrderTime(item.time)}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="快捷入口" bordered={false} style={{ height: '100%' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Card
                hoverable
                style={{ cursor: 'pointer', textAlign: 'center' }}
                bodyStyle={{ padding: '24px' }}
                onClick={() => navigate('/merchant/hotel-manage')}
              >
                <ApartmentOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  维护酒店信息
                </div>
                <div style={{ fontSize: '14px', color: '#999' }}>
                  快速编辑酒店基础信息
                </div>
              </Card>

              <Card
                hoverable
                style={{ cursor: 'pointer', textAlign: 'center' }}
                bodyStyle={{ padding: '24px' }}
                onClick={() => navigate('/merchant/room-price')}
              >
                <ClockCircleOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  设置房态房价
                </div>
                <div style={{ fontSize: '14px', color: '#999' }}>
                  批量调整价格和库存
                </div>
              </Card>

              <Card
                hoverable
                style={{ cursor: 'pointer', textAlign: 'center' }}
                bodyStyle={{ padding: '24px' }}
                onClick={() => navigate('/merchant/submission')}
              >
                <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  查看提交记录
                </div>
                <div style={{ fontSize: '14px', color: '#999' }}>
                  跟踪审核进度
                </div>
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Overview
