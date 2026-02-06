import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Descriptions, message, DatePicker, Select, Input, Spin } from 'antd'
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'

const API_BASE = 'http://localhost:8888'

function Submission() {
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    dateRange: null,
    keyword: '',
  })

  const getToken = () => {
    return localStorage.getItem('token')
  }

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/hotel-submission`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions')
      }
      
      const result = await response.json()
      const formattedData = result.data.map(item => ({
        key: item.id,
        id: item.id,
        hotelId: item.hotelId,
        hotelName: item.hotel?.nameZh || '未知酒店',
        type: '酒店信息',
        submitTime: item.createdTime ? new Date(item.createdTime).toLocaleString('zh-CN') : '-',
        submitter: item.createdBy || '-',
        status: item.status === 'PENDING' ? '审核中' : item.status === 'APPROVED' ? '已通过' : item.status === 'REJECTED' ? '已驳回' : item.status,
        auditor: item.reviewedBy || '-',
        rejectReason: item.rejectReason || '-',
        payloadJson: item.payloadJson
      }))
      
      setDataSource(formattedData)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      message.error('获取提交记录失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
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

  const columns = [
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
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Select.Option value="审核中">审核中</Select.Option>
              <Select.Option value="已通过">已通过</Select.Option>
              <Select.Option value="已驳回">已驳回</Select.Option>
            </Select>
            <DatePicker.RangePicker
              placeholder={['开始日期', '结束日期']}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
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
            scroll={{ x: 1200 }}
          />
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
        {selectedRecord && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="酒店名称" span={2}>
              {selectedRecord.hotelName}
            </Descriptions.Item>
            <Descriptions.Item label="提交类型">
              {selectedRecord.type}
            </Descriptions.Item>
            <Descriptions.Item label="提交时间">
              {selectedRecord.submitTime}
            </Descriptions.Item>
            <Descriptions.Item label="提交人">
              {selectedRecord.submitter}
            </Descriptions.Item>
            <Descriptions.Item label="审核状态">
              <Tag icon={getStatusIcon(selectedRecord.status)} color={getStatusColor(selectedRecord.status)}>
                {selectedRecord.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="审核人">
              {selectedRecord.auditor}
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
