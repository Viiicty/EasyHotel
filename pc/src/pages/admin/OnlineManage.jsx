import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, message, Descriptions, Drawer, Select, Spin } from 'antd'
import {
  CloudUploadOutlined,
  StopOutlined,
  ReloadOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { adminOnlineManageApi } from '../../api/adminOnlineManage'

function OnlineManage() {
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [offlineForm] = Form.useForm()
  const [filters, setFilters] = useState({
    status: '',
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
        key: item.id,
        onlineTime: item.available === 'UP' ? formatDateTime(item.updatedAt) : '-',
        offlineTime: item.available === 'DOWN' ? formatDateTime(item.updatedAt) : '-'
      }))
      setDataSource(formattedData)
    } catch (error) {
      console.error('Failed to load hotels:', error)
      message.error('加载酒店列表失败')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\//g, '-')
  }

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

  const handleViewDetail = async (record) => {
    setSelectedRecord(record)
    setDetailLoading(true)
    setIsDetailDrawerOpen(true)
    try {
      const data = await adminOnlineManageApi.getHotelDetail(record.id)
      setDetailData(data)
    } catch (error) {
      console.error('Failed to load hotel detail:', error)
      message.error('加载酒店详情失败')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleOnline = async (record) => {
    Modal.confirm({
      title: '确认恢复上线',
      content: `确定要将"${record.hotelName}"恢复上线吗？`,
      onOk: async () => {
        try {
          await adminOnlineManageApi.setOnline(record.id)
          message.success('恢复上线成功')
          loadHotels()
        } catch (error) {
          console.error('Online failed:', error)
          message.error('恢复上线失败')
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
            loading={loading}
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
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : detailData ? (
          <div>
            <Descriptions title="酒店信息" column={2} bordered>
              <Descriptions.Item label="酒店名称（中文）" span={2}>
                {detailData.hotel.nameZh}
              </Descriptions.Item>
              <Descriptions.Item label="酒店名称（英文）" span={2}>
                {detailData.hotel.nameEn}
              </Descriptions.Item>
              <Descriptions.Item label="城市">
                {detailData.hotel.cityCode}
              </Descriptions.Item>
              <Descriptions.Item label="星级">
                {detailData.hotel.starLevel} 星级
              </Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>
                {detailData.hotel.address}
              </Descriptions.Item>
              <Descriptions.Item label="审核状态">
                <Tag color={detailData.hotel.status === 'APPROVED' ? 'success' : 'default'}>
                  {detailData.hotel.status === 'APPROVED' ? '已审核' : '未审核'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="上架状态">
                <Tag color={detailData.hotel.available === 'UP' ? 'success' : 'default'}>
                  {detailData.hotel.available === 'UP' ? '已上架' : (detailData.hotel.available === 'DOWN' ? '已下架' : '未知')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {formatDateTime(detailData.hotel.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {formatDateTime(detailData.hotel.updatedAt)}
              </Descriptions.Item>
              {detailData.hotel.facilities && (
                <Descriptions.Item label="酒店设施" span={2}>
                  {detailData.hotel.facilities.join(', ')}
                </Descriptions.Item>
              )}
              {detailData.hotel.tags && (
                <Descriptions.Item label="快捷标签" span={2}>
                  {detailData.hotel.tags.map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </Descriptions.Item>
              )}
              {detailData.hotel.checkInTime && (
                <Descriptions.Item label="入住时间">
                  {formatDateTime(detailData.hotel.checkInTime)}
                </Descriptions.Item>
              )}
              {detailData.hotel.checkOutTime && (
                <Descriptions.Item label="离店时间">
                  {formatDateTime(detailData.hotel.checkOutTime)}
                </Descriptions.Item>
              )}
              {detailData.hotel.cancelPolicy && (
                <Descriptions.Item label="取消政策" span={2}>
                  {detailData.hotel.cancelPolicy}
                </Descriptions.Item>
              )}
              {detailData.hotel.changePolicy && (
                <Descriptions.Item label="修改政策" span={2}>
                  {detailData.hotel.changePolicy}
                </Descriptions.Item>
              )}
              {detailData.hotel.extraBedPolicy && (
                <Descriptions.Item label="加床政策" span={2}>
                  {detailData.hotel.extraBedPolicy}
                </Descriptions.Item>
              )}
            </Descriptions>

            {detailData.roomTypes && detailData.roomTypes.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3>房型信息（共 {detailData.roomTypes.length} 个房型）</h3>
                <Table
                  dataSource={detailData.roomTypes.map((rt, index) => ({
                    ...rt,
                    key: index
                  }))}
                  columns={[
                    {
                      title: '房型名称（中文）',
                      dataIndex: 'name_zh',
                      key: 'name_zh',
                    },
                    {
                      title: '房型名称（英文）',
                      dataIndex: 'name_en',
                      key: 'name_en',
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => (
                        <Tag color={status === 'APPROVED' ? 'success' : 'default'}>
                          {status === 'APPROVED' ? '已审核' : '未审核'}
                        </Tag>
                      ),
                    },
                    {
                        title: '创建时间',
                        dataIndex: 'created_time',
                        key: 'created_time',
                        render: (date) => formatDateTime(date),
                      },
                      {
                        title: '更新时间',
                        dataIndex: 'updated_time',
                        key: 'updated_time',
                        render: (date) => formatDateTime(date),
                      },
                  ]}
                  pagination={false}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            暂无数据
          </div>
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
