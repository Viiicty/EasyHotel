import { useState } from 'react'
import { Card, List, Tag, Badge, Empty, message, Button, Modal, Descriptions } from 'antd'
import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons'

function MessageCenter() {
  const [dataSource, setDataSource] = useState([
    {
      key: '1',
      type: 'audit',
      title: '酒店信息审核通过',
      content: '您提交的"杭州君悦酒店"酒店信息已通过审核',
      time: '2024-01-15 14:30',
      status: 'unread',
    },
    {
      key: '2',
      type: 'audit',
      title: '房型管理审核驳回',
      content: '您提交的"豪华大床房"房型信息被驳回，原因：价格设置过低',
      time: '2024-01-15 10:20',
      status: 'unread',
    },
    {
      key: '3',
      type: 'order',
      title: '新订单提醒',
      content: '您有1个新订单待确认，订单号：ORD20240115001',
      time: '2024-01-14 16:45',
      status: 'read',
    },
    {
      key: '4',
      type: 'order',
      title: '订单取消提醒',
      content: '订单 ORD20240113001 已被取消',
      time: '2024-01-13 09:15',
      status: 'read',
    },
    {
      key: '5',
      type: 'system',
      title: '系统维护通知',
      content: '系统将于2024-01-20 02:00-04:00进行维护，请提前做好准备',
      time: '2024-01-12 18:00',
      status: 'read',
    },
  ])

  const [selectedMessage, setSelectedMessage] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const getTypeIcon = (type) => {
    switch (type) {
      case 'audit':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'order':
        return <BellOutlined style={{ color: '#1890ff' }} />
      case 'system':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />
      default:
        return null
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'audit':
        return 'green'
      case 'order':
        return 'blue'
      case 'system':
        return 'orange'
      default:
        return 'default'
    }
  }

  const getTypeName = (type) => {
    switch (type) {
      case 'audit':
        return '审核通知'
      case 'order':
        return '订单提醒'
      case 'system':
        return '系统通知'
      default:
        return '未知'
    }
  }

  const handleMarkAsRead = (key) => {
    const newData = dataSource.map(item => {
      if (item.key === key) {
        return { ...item, status: 'read' }
      }
      return item
    })
    setDataSource(newData)
    message.success('已标记为已读')
  }

  const handleMarkAllAsRead = () => {
    const newData = dataSource.map(item => ({ ...item, status: 'read' }))
    setDataSource(newData)
    message.success('已全部标记为已读')
  }

  const handleDelete = (key) => {
    const newData = dataSource.filter(item => item.key !== key)
    setDataSource(newData)
    message.success('删除成功')
  }

  const handleViewDetail = (item) => {
    setSelectedMessage(item)
    setIsDetailModalOpen(true)
    if (item.status === 'unread') {
      handleMarkAsRead(item.key)
    }
  }

  const handleDeleteAll = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除所有已读消息吗？',
      onOk: () => {
        const newData = dataSource.filter(item => item.status === 'unread')
        setDataSource(newData)
        message.success('删除成功')
      },
    })
  }

  const getFilteredDataSource = () => {
    switch (activeTab) {
      case 'unread':
        return dataSource.filter(item => item.status === 'unread')
      case 'audit':
        return dataSource.filter(item => item.type === 'audit')
      case 'order':
        return dataSource.filter(item => item.type === 'order')
      case 'system':
        return dataSource.filter(item => item.type === 'system')
      default:
        return dataSource
    }
  }

  const unreadCount = dataSource.filter(item => item.status === 'unread').length

  return (
    <div>
      <Card
        title={
          <Space>
            <BellOutlined />
            <span>消息中心</span>
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ backgroundColor: '#ff4d4f' }} />
            )}
          </Space>
        }
        bordered={false}
        extra={
          <Space>
            <Button onClick={handleMarkAllAsRead}>
              全部已读
            </Button>
            <Button onClick={handleDeleteAll}>
              清空已读
            </Button>
          </Space>
        }
      >
        <List
          tabList={[
            { key: 'all', tab: `全部消息 (${dataSource.length})` },
            { key: 'unread', tab: `未读消息 (${unreadCount})` },
            { key: 'audit', tab: '审核通知' },
            { key: 'order', tab: '订单提醒' },
            { key: 'system', tab: '系统通知' },
          ]}
          activeTabKey={activeTab}
          onTabChange={setActiveTab}
          dataSource={getFilteredDataSource()}
          renderItem={(item) => (
            <List.Item
              style={{
                background: item.status === 'unread' ? '#e6f7ff' : 'transparent',
                padding: '16px',
                borderRadius: '4px',
                marginBottom: '8px',
              }}
              actions={[
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(item)}
                >
                  查看
                </Button>,
                item.status === 'unread' && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleMarkAsRead(item.key)}
                  >
                    标记已读
                  </Button>
                ),
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(item.key)}
                >
                  删除
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={getTypeIcon(item.type)}
                title={
                  <Space>
                    {item.status === 'unread' && <Badge status="processing" />}
                    <span style={{ fontWeight: item.status === 'unread' ? 'bold' : 'normal' }}>
                      {item.title}
                    </span>
                    <Tag color={getTypeColor(item.type)}>
                      {getTypeName(item.type)}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <div style={{ marginBottom: '8px' }}>{item.content}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {item.time}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: <Empty description="暂无消息" />,
          }}
        />
      </Card>

      <Modal
        title="消息详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={600}
        footer={
          <Button onClick={() => setIsDetailModalOpen(false)}>关闭</Button>
        }
      >
        {selectedMessage && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="消息类型">
              <Tag color={getTypeColor(selectedMessage.type)}>
                {getTypeName(selectedMessage.type)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="消息标题">
              {selectedMessage.title}
            </Descriptions.Item>
            <Descriptions.Item label="消息内容">
              {selectedMessage.content}
            </Descriptions.Item>
            <Descriptions.Item label="接收时间">
              {selectedMessage.time}
            </Descriptions.Item>
            <Descriptions.Item label="阅读状态">
              <Tag color={selectedMessage.status === 'unread' ? 'blue' : 'default'}>
                {selectedMessage.status === 'unread' ? '未读' : '已读'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default MessageCenter
