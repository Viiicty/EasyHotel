import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, message, Descriptions, Drawer, Row, Col, Tabs, Image } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons'

const API_BASE = '/api'
const { TabPane } = Tabs

function HotelAudit() {
  const [activeTab, setActiveTab] = useState('hotel')
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [roomTypePictures, setRoomTypePictures] = useState([])
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
          facilities: item.facilities || [],
          tags: item.tags || [],
          checkInTime: item.checkInTime,
          checkOutTime: item.checkOutTime,
          cancelPolicy: item.cancelPolicy,
          changePolicy: item.changePolicy,
          extraBedPolicy: item.extraBedPolicy,
          coverImage: item.coverImage,
        }))
        setDataSource(formattedData)
        
        const userIds = formattedData.flatMap(item => [item.createdBy, item.reviewedBy])
        fetchUsers(userIds)
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
      title: '面积(㎡)',
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
                  {selectedRecord.coverImage ? (
                    <img 
                      src={`${API_BASE}/upload/image/${selectedRecord.coverImage}`} 
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
                  {selectedRecord.facilities?.join(', ') || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="快捷标签">
                  {selectedRecord.tags?.join(', ') || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="入住时间">
                  {selectedRecord.checkInTime || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="离店时间">
                  {selectedRecord.checkOutTime || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="取消政策">
                  {selectedRecord.cancelPolicy || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="修改政策">
                  {selectedRecord.changePolicy || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="加床政策">
                  {selectedRecord.extraBedPolicy || '-'}
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
