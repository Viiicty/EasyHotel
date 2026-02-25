import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Descriptions, message, Input, Tabs } from 'antd'
import {
  EyeOutlined,
  SearchOutlined,
  DownloadOutlined,
  PrinterOutlined
} from '@ant-design/icons'
import { merchantOrderApi } from '../../api/merchantOrder'

const STATUS_MAP = {
  'PENDING': '待支付',
  'PAID': '待确认',
  'CONFIRMED': '已确认',
  'CANCELLED': '已取消',
  'REFUNDED': '已退款',
  'COMPLETED': '已完成'
}

const STATUS_COLOR_MAP = {
  'PENDING': 'default',
  'PAID': 'warning',
  'CONFIRMED': 'processing',
  'CANCELLED': 'default',
  'REFUNDED': 'error',
  'COMPLETED': 'success'
}

function Orders() {
  const [activeTab, setActiveTab] = useState('PAID')
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filters, setFilters] = useState({
    keyword: '',
  })

  useEffect(() => {
    loadOrders()
  }, [activeTab, pagination.current, pagination.pageSize, filters.keyword])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize
      }
      
      if (activeTab !== 'all') {
        params.status = activeTab
      }

      if (filters.keyword) {
        params.keyword = filters.keyword
      }

      const result = await merchantOrderApi.getOrders(params)
      
      setDataSource(result.orders || [])
      setPagination({
        ...pagination,
        total: result.total || 0
      })
    } catch (error) {
      console.error('加载订单失败:', error)
      message.error(error.message || '加载订单失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    return STATUS_COLOR_MAP[status] || 'default'
  }

  const getStatusText = (status) => {
    return STATUS_MAP[status] || status
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
      dataIndex: ['hotel', 'nameZh'],
      key: 'hotelName',
      width: 180,
    },
    {
      title: '房型',
      dataIndex: ['roomType', 'name'],
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
      dataIndex: 'checkinDate',
      key: 'checkIn',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('zh-CN') : '-',
    },
    {
      title: '离店日期',
      dataIndex: 'checkoutDate',
      key: 'checkOut',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('zh-CN') : '-',
    },
    {
      title: '晚数',
      dataIndex: 'nights',
      key: 'nights',
      width: 80,
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'price',
      width: 120,
      render: (price) => price ? `¥${price}` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'createdTime',
      key: 'orderTime',
      width: 180,
      render: (date) => date ? new Date(date).toLocaleString('zh-CN') : '-',
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
          {record.status === 'PAID' && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleConfirm(record)}
              >
                确认
              </Button>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleReject(record)}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  const handleViewDetail = async (order) => {
    try {
      const detail = await merchantOrderApi.getOrderById(order.id)
      setSelectedOrder(detail)
      setIsDetailModalOpen(true)
    } catch (error) {
      console.error('获取订单详情失败:', error)
      message.error(error.message || '获取订单详情失败')
    }
  }

  const handleConfirm = async (order) => {
    try {
      await merchantOrderApi.confirmOrder(order.id)
      message.success('订单已确认')
      loadOrders()
    } catch (error) {
      console.error('确认订单失败:', error)
      message.error(error.message || '确认订单失败')
    }
  }

  const handleReject = (order) => {
    Modal.confirm({
      title: '确认拒绝订单',
      content: (
        <Input.TextArea
          placeholder="请输入拒绝原因"
          rows={4}
          onChange={(e) => {
            window.rejectReason = e.target.value
          }}
        />
      ),
      onOk: async () => {
        try {
          await merchantOrderApi.rejectOrder(order.id, window.rejectReason || '')
          message.success('订单已拒绝')
          loadOrders()
        } catch (error) {
          console.error('拒绝订单失败:', error)
          message.error(error.message || '拒绝订单失败')
        }
      }
    })
  }

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 })
    loadOrders()
  }

  const handleClearSearch = () => {
    setFilters({ ...filters, keyword: '' })
    setPagination({ ...pagination, current: 1 })
    loadOrders()
  }

  const handleExport = () => {
    message.info('导出功能开发中')
  }

  const handlePrint = () => {
    message.info('打印功能开发中')
  }

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
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
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              onPressEnter={loadOrders}
              allowClear
              onClear={handleClearSearch}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              打印
            </Button>
          </Space>

          <Tabs activeKey={activeTab} onChange={(key) => {
            setActiveTab(key)
            setFilters({ ...filters, keyword: '' })
            setPagination({ ...pagination, current: 1 })
          }}>
            <Tabs.TabPane tab="全部订单" key="all" />
            <Tabs.TabPane tab="待确认" key="PAID" />
            <Tabs.TabPane tab="已确认" key="CONFIRMED" />
            <Tabs.TabPane tab="已完成" key="COMPLETED" />
            <Tabs.TabPane tab="已取消" key="CANCELLED" />
          </Tabs>

          <Table
            loading={loading}
            dataSource={dataSource}
            columns={columns}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            onChange={handleTableChange}
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
              {selectedOrder.hotel?.nameZh}
            </Descriptions.Item>
            <Descriptions.Item label="房型">
              {selectedOrder.roomType?.name}
            </Descriptions.Item>
            <Descriptions.Item label="客人姓名">
              {selectedOrder.guestName}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              {selectedOrder.guestPhone}
            </Descriptions.Item>
            <Descriptions.Item label="身份证号" span={2}>
              {selectedOrder.idCard}
            </Descriptions.Item>
            <Descriptions.Item label="入住日期">
              {selectedOrder.checkinDate ? new Date(selectedOrder.checkinDate).toLocaleDateString('zh-CN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="离店日期">
              {selectedOrder.checkoutDate ? new Date(selectedOrder.checkoutDate).toLocaleDateString('zh-CN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="晚数">
              {selectedOrder.nights}
            </Descriptions.Item>
            <Descriptions.Item label="房间数">
              {selectedOrder.rooms}
            </Descriptions.Item>
            <Descriptions.Item label="订单金额" span={2}>
              {selectedOrder.totalAmount ? `¥${selectedOrder.totalAmount}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag color={getStatusColor(selectedOrder.status)}>
                {getStatusText(selectedOrder.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="下单时间">
              {selectedOrder.createdTime ? new Date(selectedOrder.createdTime).toLocaleString('zh-CN') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default Orders
