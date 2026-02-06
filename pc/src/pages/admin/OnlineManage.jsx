import { useState } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, message, Descriptions, Drawer, Select } from 'antd'
import {
  CloudUploadOutlined,
  StopOutlined,
  ReloadOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons'

function OnlineManage() {
  const [dataSource, setDataSource] = useState([
    {
      key: '1',
      hotelName: '杭州君悦酒店',
      hotelNameEn: 'Grand Hyatt Hangzhou',
      merchant: '张三',
      city: '杭州',
      starLevel: 5,
      status: 'ONLINE',
      onlineTime: '2024-01-10 10:00',
      offlineTime: '-',
    },
    {
      key: '2',
      hotelName: '北京瑞吉酒店',
      hotelNameEn: 'The St. Regis Beijing',
      merchant: '李四',
      city: '北京',
      starLevel: 5,
      status: 'ONLINE',
      onlineTime: '2024-01-08 14:30',
      offlineTime: '-',
    },
    {
      key: '3',
      hotelName: '上海浦东香格里拉',
      hotelNameEn: 'Pudong Shangri-La Shanghai',
      merchant: '王五',
      city: '上海',
      starLevel: 5,
      status: 'OFFLINE',
      onlineTime: '2024-01-05 09:15',
      offlineTime: '2024-01-12 16:00',
    },
    {
      key: '4',
      hotelName: '广州白云宾馆',
      hotelNameEn: 'Guangzhou Baiyun Hotel',
      merchant: '赵六',
      city: '广州',
      starLevel: 4,
      status: 'ONLINE',
      onlineTime: '2024-01-03 11:20',
      offlineTime: '-',
    },
  ])

  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [offlineForm] = Form.useForm()
  const [filters, setFilters] = useState({
    status: '',
    city: '',
    keyword: '',
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE':
        return 'success'
      case 'OFFLINE':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'ONLINE':
        return '已上线'
      case 'OFFLINE':
        return '已下线'
      default:
        return '未知'
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
      title: '最近上线时间',
      dataIndex: 'onlineTime',
      key: 'onlineTime',
      width: 180,
    },
    {
      title: '最近下线时间',
      dataIndex: 'offlineTime',
      key: 'offlineTime',
      width: 180,
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
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {record.status === 'ONLINE' && (
            <Button
              type="link"
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleOffline(record)}
            >
              下线
            </Button>
          )}
          {record.status === 'OFFLINE' && (
            <Button
              type="link"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => handleOnline(record)}
            >
              恢复上线
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const handleViewDetail = (record) => {
    setSelectedRecord(record)
    setIsDetailDrawerOpen(true)
  }

  const handleOnline = (record) => {
    Modal.confirm({
      title: '确认恢复上线',
      content: `确定要将"${record.hotelName}"恢复上线吗？`,
      onOk: () => {
        const newData = dataSource.map(item => {
          if (item.key === record.key) {
            return {
              ...item,
              status: 'ONLINE',
              onlineTime: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }).replace(/\//g, '-'),
              offlineTime: '-',
            }
          }
          return item
        })
        setDataSource(newData)
        message.success('恢复上线成功')
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
      const newData = dataSource.map(item => {
        if (item.key === selectedRecord.key) {
          return {
            ...item,
            status: 'OFFLINE',
            offlineTime: new Date().toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }).replace(/\//g, '-'),
          }
        }
        return item
      })
      setDataSource(newData)
      message.success('下线成功')
      setIsOfflineModalOpen(false)
    } catch (error) {
      console.error('Offline failed:', error)
    }
  }

  const filteredDataSource = dataSource.filter(item => {
    if (filters.status && item.status !== filters.status) return false
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
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Select.Option value="ONLINE">已上线</Select.Option>
              <Select.Option value="OFFLINE">已下线</Select.Option>
            </Select>
            <Select
              placeholder="城市"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, city: value })}
            >
              <Select.Option value="北京">北京</Select.Option>
              <Select.Option value="上海">上海</Select.Option>
              <Select.Option value="杭州">杭州</Select.Option>
              <Select.Option value="广州">广州</Select.Option>
            </Select>
          </Space>

          <Table
            dataSource={filteredDataSource}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{ x: 1400 }}
          />
        </Space>
      </Card>

      <Drawer
        title="酒店详情"
        placement="right"
        width={800}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
      >
        {selectedRecord && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="酒店名称（中文）" span={2}>
              {selectedRecord.hotelName}
            </Descriptions.Item>
            <Descriptions.Item label="酒店名称（英文）" span={2}>
              {selectedRecord.hotelNameEn}
            </Descriptions.Item>
            <Descriptions.Item label="城市">
              {selectedRecord.city}
            </Descriptions.Item>
            <Descriptions.Item label="星级">
              {selectedRecord.starLevel} 星级
            </Descriptions.Item>
            <Descriptions.Item label="商户">
              {selectedRecord.merchant}
            </Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={getStatusColor(selectedRecord.status)}>
                {getStatusText(selectedRecord.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="最近上线时间">
              {selectedRecord.onlineTime}
            </Descriptions.Item>
            <Descriptions.Item label="最近下线时间">
              {selectedRecord.offlineTime}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

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
