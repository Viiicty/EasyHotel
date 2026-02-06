import { useState } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Descriptions, message, DatePicker, Select, Input, Tabs } from 'antd'
import {
  EyeOutlined,
  SearchOutlined,
  DownloadOutlined,
  PrinterOutlined
} from '@ant-design/icons'

function Orders() {
  const [activeTab, setActiveTab] = useState('all')
  const [dataSource, setDataSource] = useState([
    {
      key: '1',
      orderNo: 'ORD20240115001',
      hotelName: '杭州君悦酒店',
      roomType: '豪华大床房',
      guestName: '张三',
      checkIn: '2024-01-20',
      checkOut: '2024-01-22',
      nights: 2,
      price: 1200,
      status: '已确认',
      orderTime: '2024-01-15 14:30',
    },
    {
      key: '2',
      orderNo: 'ORD20240115002',
      hotelName: '北京瑞吉酒店',
      roomType: '标准双床房',
      guestName: '李四',
      checkIn: '2024-01-18',
      checkOut: '2024-01-19',
      nights: 1,
      price: 600,
      status: '待确认',
      orderTime: '2024-01-15 10:20',
    },
    {
      key: '3',
      orderNo: 'ORD20240114001',
      hotelName: '上海浦东香格里拉',
      roomType: '行政套房',
      guestName: '王五',
      checkIn: '2024-01-17',
      checkOut: '2024-01-19',
      nights: 2,
      price: 2400,
      status: '已完成',
      orderTime: '2024-01-14 16:45',
    },
    {
      key: '4',
      orderNo: 'ORD20240113001',
      hotelName: '广州白云宾馆',
      roomType: '豪华大床房',
      guestName: '赵六',
      checkIn: '2024-01-16',
      checkOut: '2024-01-17',
      nights: 1,
      price: 500,
      status: '已取消',
      orderTime: '2024-01-13 09:15',
    },
  ])

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    dateRange: null,
    keyword: '',
  })

  const getStatusColor = (status) => {
    switch (status) {
      case '待确认':
        return 'warning'
      case '已确认':
        return 'processing'
      case '已完成':
        return 'success'
      case '已取消':
        return 'default'
      default:
        return 'default'
    }
  }

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 150,
    },
    {
      title: '酒店名称',
      dataIndex: 'hotelName',
      key: 'hotelName',
      width: 180,
    },
    {
      title: '房型',
      dataIndex: 'roomType',
      key: 'roomType',
      width: 120,
    },
    {
      title: '客人姓名',
      dataIndex: 'guestName',
      key: 'guestName',
      width: 100,
    },
    {
      title: '入住日期',
      dataIndex: 'checkIn',
      key: 'checkIn',
      width: 120,
    },
    {
      title: '离店日期',
      dataIndex: 'checkOut',
      key: 'checkOut',
      width: 120,
    },
    {
      title: '晚数',
      dataIndex: 'nights',
      key: 'nights',
      width: 80,
    },
    {
      title: '订单金额',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => `¥${price}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'orderTime',
      key: 'orderTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
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
          {record.status === '待确认' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleConfirm(record)}
            >
              确认
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const handleViewDetail = (order) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  const handleConfirm = (order) => {
    const newData = dataSource.map(item => {
      if (item.key === order.key) {
        return { ...item, status: '已确认' }
      }
      return item
    })
    setDataSource(newData)
    message.success('订单已确认')
  }

  const handleExport = () => {
    message.info('导出功能开发中')
  }

  const handlePrint = () => {
    message.info('打印功能开发中')
  }

  const getFilteredDataSource = (status) => {
    let filtered = dataSource

    if (status !== 'all') {
      filtered = filtered.filter(item => item.status === status)
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status)
    }

    if (filters.keyword) {
      filtered = filtered.filter(item =>
        item.orderNo.includes(filters.keyword) ||
        item.hotelName.includes(filters.keyword) ||
        item.guestName.includes(filters.keyword)
      )
    }

    return filtered
  }

  return (
    <div>
      <Card title="订单管理" bordered={false}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space wrap>
            <Input
              placeholder="搜索订单号/酒店/客人"
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
            <Select
              placeholder="订单状态"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Select.Option value="待确认">待确认</Select.Option>
              <Select.Option value="已确认">已确认</Select.Option>
              <Select.Option value="已完成">已完成</Select.Option>
              <Select.Option value="已取消">已取消</Select.Option>
            </Select>
            <DatePicker.RangePicker
              placeholder={['入住日期', '离店日期']}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              打印
            </Button>
          </Space>

          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <Tabs.TabPane tab="全部订单" key="all" />
            <Tabs.TabPane tab="待确认" key="待确认" />
            <Tabs.TabPane tab="已确认" key="已确认" />
            <Tabs.TabPane tab="已完成" key="已完成" />
            <Tabs.TabPane tab="已取消" key="已取消" />
          </Tabs>

          <Table
            dataSource={getFilteredDataSource(activeTab)}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{ x: 1500 }}
          />
        </Space>
      </Card>

      <Modal
        title="订单详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={800}
        footer={
          <Button onClick={() => setIsDetailModalOpen(false)}>关闭</Button>
        }
      >
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="订单号" span={2}>
              {selectedOrder.orderNo}
            </Descriptions.Item>
            <Descriptions.Item label="酒店名称">
              {selectedOrder.hotelName}
            </Descriptions.Item>
            <Descriptions.Item label="房型">
              {selectedOrder.roomType}
            </Descriptions.Item>
            <Descriptions.Item label="客人姓名">
              {selectedOrder.guestName}
            </Descriptions.Item>
            <Descriptions.Item label="入住日期">
              {selectedOrder.checkIn}
            </Descriptions.Item>
            <Descriptions.Item label="离店日期">
              {selectedOrder.checkOut}
            </Descriptions.Item>
            <Descriptions.Item label="晚数">
              {selectedOrder.nights}
            </Descriptions.Item>
            <Descriptions.Item label="订单金额" span={2}>
              ¥{selectedOrder.price}
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag color={getStatusColor(selectedOrder.status)}>
                {selectedOrder.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="下单时间">
              {selectedOrder.orderTime}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default Orders
