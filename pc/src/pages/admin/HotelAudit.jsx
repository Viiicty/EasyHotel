import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, message, Descriptions, Drawer, Row, Col } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons'

const API_BASE = 'http://localhost:8888'

function HotelAudit() {
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [auditForm] = Form.useForm()
  const [filters, setFilters] = useState({
    status: 'PENDING',
    city: '',
    keyword: '',
  })

  const getToken = () => {
    return localStorage.getItem('token')
  }

  useEffect(() => {
    fetchHotels()
  }, [filters.status])

  const fetchHotels = async () => {
    setLoading(true)
    try {
      const token = getToken()
      let url = `${API_BASE}/hotel`
      const params = new URLSearchParams()
      
      if (filters.status) {
        params.append('status', filters.status)
      }
      
      if (filters.city) {
        params.append('cityCode', filters.city)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url, {
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
        message.error(errorData.message || '获取酒店列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch hotels:', error)
      message.error('网络错误，请检查后端服务是否启动')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'processing'
      case 'APPROVED':
        return 'success'
      case 'REJECTED':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return '待审核'
      case 'APPROVED':
        return '已通过'
      case 'REJECTED':
        return '已驳回'
      case 'DRAFT':
        return '草稿'
      default:
        return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return null
      case 'APPROVED':
        return <CheckCircleOutlined />
      case 'REJECTED':
        return <CloseCircleOutlined />
      default:
        return null
    }
  }

  const columns = [
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
      render: (date) => date ? new Date(date).toLocaleString('zh-CN') : '-',
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
      render: (reviewer) => reviewer || '-',
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
          {record.status === 'PENDING' && (
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

  const handleViewDetail = (record) => {
    setSelectedRecord(record)
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
      const hotelData = {
        status: values.action === 'approve' ? 'APPROVED' : 'REJECTED',
        reviewedBy: 'admin',
        rejectReason: values.reason || '',
      }

      const response = await fetch(`${API_BASE}/hotel/${selectedRecord.id}/audit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hotelData)
      })

      if (response.ok) {
        message.success(values.action === 'approve' ? '审核通过' : '审核驳回')
        setIsAuditModalOpen(false)
        fetchHotels()
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
    if (filters.city && item.cityCode !== filters.city) return false
    if (filters.keyword && !item.nameZh?.includes(filters.keyword) && !item.nameEn?.includes(filters.keyword)) return false
    return true
  })

  return (
    <div>
      <Card title="酒店信息审核" bordered={false}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space wrap>
            <Input
              placeholder="搜索酒店名称/商户"
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
              <Select.Option value="PENDING">待审核</Select.Option>
              <Select.Option value="APPROVED">已通过</Select.Option>
              <Select.Option value="REJECTED">已驳回</Select.Option>
              <Select.Option value="DRAFT">草稿</Select.Option>
            </Select>
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
                <Descriptions.Item label="提交时间">
                  {selectedRecord.createdAt ? new Date(selectedRecord.createdAt).toLocaleString('zh-CN') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="审核状态" span={2}>
                  <Tag icon={getStatusIcon(selectedRecord.status)} color={getStatusColor(selectedRecord.status)}>
                    {getStatusText(selectedRecord.status)}
                  </Tag>
                </Descriptions.Item>
                {selectedRecord.status === 'REJECTED' && (
                  <Descriptions.Item label="驳回原因" span={2}>
                    {selectedRecord.rejectReason}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card title="提交内容快照" bordered={false}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="地址">
                  {selectedRecord.address || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="开业时间">
                  {selectedRecord.openedDate ? new Date(selectedRecord.openedDate).toLocaleDateString('zh-CN') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="联系电话">
                  -
                </Descriptions.Item>
                <Descriptions.Item label="联系邮箱">
                  -
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="审核信息" bordered={false}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="审核人">
                  {selectedRecord.reviewedBy || '-'}
                </Descriptions.Item>
                {selectedRecord.status === 'REJECTED' && (
                  <Descriptions.Item label="驳回原因">
                    {selectedRecord.rejectReason}
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
            label="酒店名称"
          >
            <Input value={selectedRecord?.nameZh} disabled />
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
