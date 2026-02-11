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
        facilities: item.facilities || [],
        tags: item.tags || [],
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
              {selectedRecord.facilities.join(', ')}
            </Descriptions.Item>
            <Descriptions.Item label="快捷标签" span={2}>
              {selectedRecord.tags.join(', ')}
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
            <Descriptions.Item label="面积(㎡)">
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
