import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, message, Select } from 'antd'
import {
  CloudUploadOutlined,
  StopOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { adminOnlineManageApi } from '../../api/adminOnlineManage'

function OnlineManage() {
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [offlineForm] = Form.useForm()
  const [filters, setFilters] = useState({
    available: '',
    city: '',
    keyword: '',
  })

  useEffect(() => {
    loadHotels()
  }, [filters])

  const loadHotels = async () => {
    setLoading(true)
    try {
      const data = await adminOnlineManageApi.getHotels(filters)
      const formattedData = data.map(item => ({
        ...item,
        key: item.id
      }))
      setDataSource(formattedData)
    } catch (error) {
      console.error('Failed to load hotels:', error)
      message.error('加载酒店列表失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (available) => {
    switch (available) {
      case 'UP':
        return 'success'
      case 'DOWN':
        return 'default'
      default:
        return 'warning'
    }
  }

  const getStatusText = (available) => {
    switch (available) {
      case 'UP':
        return '已上线'
      case 'DOWN':
        return '已下线'
      default:
        return '待操作'
    }
  }

  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'hotelName',
      key: 'hotelName',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.hotelNameEn}</div>
        </div>
      ),
    },
    {
      title: '商户',
      dataIndex: 'merchant',
      key: 'merchant',
      width: 100,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 100,
    },
    {
      title: '星级',
      dataIndex: 'starLevel',
      key: 'starLevel',
      width: 80,
      render: (level) => {
        const stars = []
        for (let i = 0; i < level; i++) {
          stars.push('★')
        }
        return <span style={{ color: '#faad14' }}>{stars.join('')}</span>
      },
    },
    {
      title: '当前状态',
      dataIndex: 'available',
      key: 'available',
      width: 120,
      render: (available) => (
        <Tag color={getStatusColor(available)}>
          {getStatusText(available)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<CloudUploadOutlined />}
            onClick={() => handleOnline(record)}
          >
            上线
          </Button>
          <Button
            type="link"
            size="small"
            icon={<StopOutlined />}
            onClick={() => handleOffline(record)}
          >
            下线
          </Button>
        </Space>
      ),
    },
  ]

  const handleOnline = async (record) => {
    Modal.confirm({
      title: '确认上线',
      content: `确定要将"${record.hotelName}"上线吗？`,
      onOk: async () => {
        try {
          await adminOnlineManageApi.setOnline(record.id)
          message.success('上线成功')
          loadHotels()
        } catch (error) {
          console.error('Online failed:', error)
          message.error('上线失败')
        }
      },
    })
  }

  const handleOffline = (record) => {
    setSelectedRecord(record)
    offlineForm.resetFields()
    setIsOfflineModalOpen(true)
  }

  const handleOfflineSubmit = async (values) => {
    try {
      await adminOnlineManageApi.setOffline(selectedRecord.id, values.reason)
      message.success('下线成功')
      setIsOfflineModalOpen(false)
      loadHotels()
    } catch (error) {
      console.error('Offline failed:', error)
      message.error('下线失败')
    }
  }

  const filteredDataSource = dataSource.filter(item => {
    if (filters.available && item.available !== filters.available) return false
    if (filters.city && item.city !== filters.city) return false
    if (filters.keyword && !item.hotelName.includes(filters.keyword) && !item.merchant.includes(filters.keyword)) return false
    return true
  })

  return (
    <div>
      <Card title="上线管理" bordered={false}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space wrap>
            <Input
              placeholder="搜索酒店名称/商户"
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
            <Select
              placeholder="上线状态"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, available: value })}
            >
              <Select.Option value="UP">已上线</Select.Option>
              <Select.Option value="DOWN">已下线</Select.Option>
            </Select>
            {/* <Select
              placeholder="城市"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, city: value })}
            >
              <Select.Option value="北京">北京</Select.Option>
              <Select.Option value="上海">上海</Select.Option>
              <Select.Option value="杭州">杭州</Select.Option>
              <Select.Option value="广州">广州</Select.Option>
            </Select> */}
          </Space>

          <Table
            dataSource={filteredDataSource}
            columns={columns}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{ x: 1000 }}
          />
        </Space>
      </Card>

      <Modal
        title="下线确认"
        open={isOfflineModalOpen}
        onCancel={() => setIsOfflineModalOpen(false)}
        width={600}
        footer={null}
      >
        <Form
          form={offlineForm}
          layout="vertical"
          onFinish={handleOfflineSubmit}
        >
          <Form.Item
            label="酒店名称"
          >
            <Input value={selectedRecord?.hotelName} disabled />
          </Form.Item>

          <Form.Item
            label="下线原因"
            name="reason"
            rules={[{ required: true, message: '请输入下线原因' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入下线原因（200字以内）" maxLength={200} showCount />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsOfflineModalOpen(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确认下线
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default OnlineManage
