import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, List, Tag, Space, Badge, Button } from 'antd'
import {
  AuditOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ApartmentOutlined
} from '@ant-design/icons'

const API_BASE = '/api'

function AuditCenter() {
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)
  const [todayAuditedCount, setTodayAuditedCount] = useState(0)
  const [todayApprovedCount, setTodayApprovedCount] = useState(0)
  const [todayRejectedCount, setTodayRejectedCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pendingAudits, setPendingAudits] = useState([])
  const [recentAudits, setRecentAudits] = useState([])

  const getToken = () => {
    return localStorage.getItem('token')
  }

  const fetchPendingCount = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/hotel-submission/stats/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setPendingCount(result.data?.count || 0)
      }
    } catch (error) {
      console.error('Error fetching pending count:', error)
    }
  }

  const fetchTodayAuditedCount = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/hotel-submission/stats/today-audited`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setTodayAuditedCount(result.data?.count || 0)
      }
    } catch (error) {
      console.error('Error fetching today audited count:', error)
    }
  }

  const fetchTodayApprovedCount = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/hotel-submission/stats/today-approved`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setTodayApprovedCount(result.data?.count || 0)
      }
    } catch (error) {
      console.error('Error fetching today approved count:', error)
    }
  }

  const fetchTodayRejectedCount = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/hotel-submission/stats/today-rejected`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setTodayRejectedCount(result.data?.count || 0)
      }
    } catch (error) {
      console.error('Error fetching today rejected count:', error)
    }
  }

  const fetchPendingAudits = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/hotel-submission/pending-all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        const data = result.data || []
        setPendingAudits(Array.isArray(data) ? data : [])
      } else {
        console.error('fetchPendingAudits 响应错误:', response.status)
      }
    } catch (error) {
      console.error('Error fetching pending audits:', error)
      setPendingAudits([])
    }
  }

  const fetchRecentAudits = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/hotel-submission/recent-audits?limit=4`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        const data = result.data || []
        setRecentAudits(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching recent audits:', error)
      setRecentAudits([])
    }
  }

  useEffect(() => {
    fetchPendingCount()
    fetchTodayAuditedCount()
    fetchTodayApprovedCount()
    fetchTodayRejectedCount()
    fetchPendingAudits()
    fetchRecentAudits()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'processing'
      case 'REJECTED':
        return 'error'
      case 'APPROVED':
        return 'success'
      case '审核中':
        return 'processing'
      case '已驳回':
        return 'error'
      case '已通过':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return '审核中'
      case 'REJECTED':
        return '已驳回'
      case 'APPROVED':
        return '已通过'
      default:
        return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case '审核中':
        return <ClockCircleOutlined />
      case '已驳回':
        return <CloseCircleOutlined />
      case '已通过':
        return <CheckCircleOutlined />
      default:
        return null
    }
  }

  const formatTime = (date) => {
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

  const handleAudit = (item) => {
    navigate('/admin/hotel-audit', { state: { item } })
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'hotel-audit':
        navigate('/admin/hotel-audit')
        break
      case 'online-manage':
        navigate('/admin/online-manage')
        break
      case 'banner-manage':
        navigate('/admin/banner-manage')
        break
      default:
        break
    }
  }

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="审核概览" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="待审核"
                  value={pendingCount}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                  loading={loading}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="今日已审核"
                  value={todayAuditedCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                  loading={loading}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="今日通过"
                  value={todayApprovedCount}
                  valueStyle={{ color: '#3f8600' }}
                  loading={loading}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="今日驳回"
                  value={todayRejectedCount}
                  valueStyle={{ color: '#cf1322' }}
                  loading={loading}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={
              <Space>
                <Badge count={pendingAudits.length} offset={[10, 5]}>
                  <span style={{ fontSize: '24px' }}>待审核列表</span>
                </Badge>
              </Space>
            }
            bordered={false}
            style={{ height: '100%' }}
          >
            <List
              dataSource={pendingAudits}
              style={{ height: 400, overflowY: 'auto' }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleAudit(item)}
                    >
                      审核
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Badge status={getStatusColor(item.status)} />}
                    title={
                      <Space>
                        <span style={{ fontSize: '14px' }}>{item.hotelName || '未知酒店'}</span>
                        <Tag color={getStatusColor(item.status)} style={{ fontSize: '13px' }}>
                          {item.type === 'hotel' ? '酒店信息' : '房型信息'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <ClockCircleOutlined style={{ fontSize: '12px', color: '#999' }} />
                        <span style={{ fontSize: '14px', color: '#666' }}>{formatTime(item.createdTime)}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无待审核数据' }}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="最近审核记录" bordered={false} style={{ height: '100%' }}>
            <List
              dataSource={recentAudits}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Badge status={getStatusColor(item.status)} />}
                    title={
                      <Space>
                        <span style={{ fontSize: '14px' }}>{item.hotelName || '未知酒店'}</span>
                        <Tag color={getStatusColor(item.status)} style={{ fontSize: '12px' }}>
                          {item.type === 'hotel' ? '酒店信息' : '房型信息'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Space style={{ marginBottom: '4px' }}>
                          <ClockCircleOutlined style={{ fontSize: '12px', color: '#999' }} />
                          <span style={{ fontSize: '14px', color: '#666' }}>{formatTime(item.updatedTime)}</span>
                        </Space>
                        <div style={{ fontSize: '14px', color: item.status === 'APPROVED' ? '#52c41a' : '#ff4d4f' }}>
                          {item.status === 'APPROVED' ? '已通过' : '已驳回'}
                          {item.status === 'REJECTED' && item.rejectReason && (
                            <span style={{ marginLeft: '8px', color: '#666' }}>
                              ({item.rejectReason})
                            </span>
                          )}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={24} style={{ marginTop: '24px' }}>
          <Card title="快捷操作" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Card
                  hoverable
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                  bodyStyle={{ padding: '24px' }}
                  onClick={() => handleQuickAction('hotel-audit')}
                >
                  <ApartmentOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '16px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    酒店信息审核
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    审核酒店基础信息
                  </div>
                </Card>
              </Col>

              <Col span={6}>
                <Card
                  hoverable
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                  bodyStyle={{ padding: '24px' }}
                  onClick={() => handleQuickAction('online-manage')}
                >
                  <FileTextOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '16px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    上线管理
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    管理酒店上线状态
                  </div>
                </Card>
              </Col>

              <Col span={6}>
                <Card
                  hoverable
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                  bodyStyle={{ padding: '24px' }}
                  onClick={() => handleQuickAction('banner-manage')}
                >
                  <AuditOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '16px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    Banner 管理
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    管理首页 Banner
                  </div>
                </Card>
              </Col>

              <Col span={6}>
                <Card
                  hoverable
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <ClockCircleOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: '16px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    操作日志
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    查看操作记录
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AuditCenter
