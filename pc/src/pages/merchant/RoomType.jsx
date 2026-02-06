import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Drawer, InputNumber, Checkbox, AutoComplete } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  CopyOutlined,
  StopOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  SendOutlined
} from '@ant-design/icons'

const API_BASE = 'http://localhost:8888'

function RoomType() {
  const [hotels, setHotels] = useState([])
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [dataSource, setDataSource] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [hotelsLoading, setHotelsLoading] = useState(true)
  const [apiError, setApiError] = useState(null)

  const getToken = () => {
    return localStorage.getItem('token')
  }

  useEffect(() => {
    console.log('RoomType component mounted')
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    setHotelsLoading(true)
    setApiError(null)
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/hotel`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setHotels(result || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', response.status, errorData)
        setApiError(`获取酒店列表失败 (${response.status})`)
        message.error(errorData.message || '获取酒店列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch hotels:', error)
      setApiError('网络错误，无法连接到服务器')
      message.error('网络错误，请检查后端服务是否启动')
    } finally {
      setHotelsLoading(false)
    }
  }

  const fetchRoomTypes = async (hotelId) => {
    setLoading(true)
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/room-type/hotel/${hotelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setDataSource(result || [])
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

  const handleSearch = (value) => {
    setSearchValue(value)
  }

  const handleSelectHotel = (hotelId) => {
    const hotel = hotels.find(hotel => hotel.id === hotelId)
    setSelectedHotel(hotel)
    message.success(`已选择酒店：${hotel?.nameZh}`)
    fetchRoomTypes(hotelId)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default'
      case 'pending':
        return 'processing'
      case 'approved':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'draft':
        return '草稿'
      case 'pending':
        return '待审核'
      case 'approved':
        return '已通过'
      default:
        return status
    }
  }

  const columns = [
    {
      title: '房型名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '面积（㎡）',
      dataIndex: 'areaSqm',
      key: 'areaSqm',
      width: 120,
    },
    {
      title: '床型',
      dataIndex: 'bedType',
      key: 'bedType',
      width: 100,
    },
    {
      title: '可住人数',
      dataIndex: 'maxGuests',
      key: 'maxGuests',
      width: 100,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '最后修改时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date) => date ? new Date(date).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === 'draft' && (
            <Button
              type="link"
              size="small"
              icon={<SendOutlined />}
              onClick={() => handleSubmitForReview(record)}
            >
              提交审核
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const handleEdit = (record) => {
    setEditingRoom(record)
    form.setFieldsValue({
      name: record.name,
      areaSqm: record.areaSqm,
      bedType: record.bedType,
      maxGuests: record.maxGuests,
      breakfast: record.breakfast === 'yes',
    })
    setIsDrawerOpen(true)
  }

  const handleAdd = () => {
    if (!selectedHotel) {
      message.warning('请先选择一个酒店')
      return
    }
    form.resetFields()
    setEditingRoom(null)
    setIsDrawerOpen(true)
  }

  const handleDrawerOk = async () => {
    try {
      const values = await form.validateFields()
      const token = getToken()
      
      const roomTypeData = {
        ...values,
        hotelId: selectedHotel?.id,
        status: 'draft',
        breakfast: values.breakfast ? 'yes' : 'no',
      }

      if (editingRoom) {
        const response = await fetch(`${API_BASE}/room-type/${editingRoom.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(roomTypeData)
        })
        
        if (response.ok) {
          message.success('修改成功')
          fetchRoomTypes(selectedHotel.id)
        } else {
          const errorData = await response.json().catch(() => ({}))
          message.error(errorData.message || '修改失败')
        }
      } else {
        const response = await fetch(`${API_BASE}/room-type`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(roomTypeData)
        })
        
        if (response.ok) {
          message.success('添加成功，已保存为草稿')
          fetchRoomTypes(selectedHotel.id)
        } else {
          const errorData = await response.json().catch(() => ({}))
          message.error(errorData.message || '添加失败')
        }
      }
      setIsDrawerOpen(false)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleSubmitForReview = async (record) => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/room-type/${record.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        message.success('提交审核成功')
        fetchRoomTypes(selectedHotel.id)
      } else {
        const errorData = await response.json().catch(() => ({}))
        message.error(errorData.message || '提交审核失败')
      }
    } catch (error) {
      console.error('Submit for review failed:', error)
      message.error('网络错误，提交审核失败')
    }
  }

  return (
    <div>
      <Card
        title="房型管理"
        bordered={false}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增房型
          </Button>
        }
      >
        {apiError && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '4px', color: '#ff4d4f' }}>
            {apiError}
          </div>
        )}

        {hotelsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            加载中...
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              <Space style={{ width: '100%' }} size="large">
                <AutoComplete
                  style={{ width: 500 }}
                  placeholder="请搜索并选择酒店"
                  value={searchValue}
                  options={hotels
                    .filter(hotel => 
                      hotel.nameZh?.toLowerCase().includes(searchValue.toLowerCase()) ||
                      hotel.nameEn?.toLowerCase().includes(searchValue.toLowerCase())
                    )
                    .map(hotel => ({
                      value: hotel.id,
                      label: `${hotel.nameZh} ${hotel.nameEn ? `(${hotel.nameEn})` : ''}`,
                    }))
                  }
                  onSelect={handleSelectHotel}
                  onSearch={handleSearch}
                  filterOption={(inputValue, option) =>
                    option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                >
                  <Input
                    suffix={<SearchOutlined />}
                  />
                </AutoComplete>
                
                {selectedHotel && (
                  <Tag color="blue" closable onClose={() => setSelectedHotel(null)} style={{ fontSize: '16px', padding: '8px 16px' }}>
                    已选：{selectedHotel.nameZh}
                  </Tag>
                )}
              </Space>
            </div>

            {!selectedHotel ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                请先在上方搜索栏中选择一个酒店
              </div>
            ) : (
              <>
                {roomTypesError && (
                  <div style={{ marginBottom: '16px', padding: '12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px', color: '#faad14' }}>
                    {roomTypesError}
                  </div>
                )}
                <Table
                  dataSource={dataSource}
                  columns={columns}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                  }}
                  loading={loading}
                />
              </>
            )}
          </>
        )}

      </Card>

      <Drawer
        title={editingRoom ? '编辑房型' : '新增房型'}
        placement="right"
        width={600}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsDrawerOpen(false)}>取消</Button>
              <Button type="primary" onClick={handleDrawerOk}>
                确定
              </Button>
            </Space>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            areaSqm: 30,
            bedType: '大床',
            maxGuests: 2,
            breakfast: false,
          }}
        >
          <Form.Item
            label="房型名称"
            name="name"
            rules={[{ required: true, message: '请输入房型名称' }]}
          >
            <Input placeholder="请输入房型名称" />
          </Form.Item>

          <Form.Item
            label="面积（㎡）"
            name="areaSqm"
            rules={[{ required: true, message: '请输入面积' }]}
          >
            <InputNumber min={10} max={200} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="床型"
            name="bedType"
            rules={[{ required: true, message: '请选择床型' }]}
          >
            <Select placeholder="请选择床型">
              <Select.Option value="大床">大床</Select.Option>
              <Select.Option value="双床">双床</Select.Option>
              <Select.Option value="特大床">特大床</Select.Option>
              <Select.Option value="单人床">单人床</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="可住人数"
            name="maxGuests"
            rules={[{ required: true, message: '请输入可住人数' }]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="是否含早" name="breakfast" valuePropName="checked">
            <Checkbox>含早餐</Checkbox>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}

export default RoomType
