import { useState } from 'react'
import { Card, Row, Col, Statistic, List, Tag, Space, Badge, Button } from 'antd'
import {
  AuditOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ApartmentOutlined
} from '@ant-design/icons'

function AuditCenter() {
  const [pendingAudits, setPendingAudits] = useState([
    { id: 1, hotel: '杭州君悦酒店', type: '酒店信息', submitter: '张三', time: '2小时前', status: '审核中' },
    { id: 2, hotel: '北京瑞吉酒店', type: '房型管理', submitter: '李四', time: '5小时前', status: '审核中' },
    { id: 3, hotel: '上海浦东香格里拉', type: '房态房价', submitter: '王五', time: '1天前', status: '审核中' },
    { id: 4, hotel: '广州白云宾馆', type: '提交记录', submitter: '赵六', time: '2天前', status: '审核中' },
  ])

  const [recentAudits, setRecentAudits] = useState([
    { id: 1, hotel: '深圳华侨城洲际酒店', type: '酒店信息', submitter: '钱七', time: '3小时前', status: '已通过', auditor: '管理员' },
    { id: 2, hotel: '南京金陵饭店', type: '房型管理', submitter: '孙八', time: '6小时前', status: '已驳回', auditor: '管理员', reason: '价格设置过低' },
    { id: 3, hotel: '成都博舍', type: '房态房价', submitter: '周九', time: '1天前', status: '已通过', auditor: '管理员' },
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case '审核中':
        return 'processing'
      case '已驳回':
        return 'error'
      case '已通过':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case '审核中':
        return <ClockCircleOutlined />
      case '已驳回':
        return <CloseCircleOutlined />
      case '已通过':
        return <CheckCircleOutlined />
      default:
        return null
    }
  }

  const handleAudit = (item) => {
    console.log('审核:', item)
  }

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="审核概览" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="待审核"
                  value={pendingAudits.length}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="今日已审核"
                  value={15}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="今日通过"
                  value={12}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="今日驳回"
                  value={3}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={
              <Space>
                <Badge count={pendingAudits.length} offset={[10, 0]}>
                  <span>待审核列表</span>
                </Badge>
              </Space>
            }
            bordered={false}
            style={{ height: '100%' }}
          >
            <List
              dataSource={pendingAudits}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleAudit(item)}
                    >
                      审核
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Badge status={getStatusColor(item.status)} />}
                    title={
                      <Space>
                        <span>{item.hotel}</span>
                        <Tag color={getStatusColor(item.status)}>{item.type}</Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <span style={{ fontSize: '14px', color: '#666' }}>
                          提交人: {item.submitter}
                        </span>
                        <span style={{ fontSize: '14px', color: '#999' }}>
                          {item.time}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="最近审核记录" bordered={false} style={{ height: '100%' }}>
            <List
              dataSource={recentAudits}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Badge status={getStatusColor(item.status)} />}
                    title={
                      <Space>
                        <span>{item.hotel}</span>
                        <Tag color={getStatusColor(item.status)}>{item.type}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Space style={{ marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', color: '#666' }}>
                            提交人: {item.submitter}
                          </span>
                          <span style={{ fontSize: '14px', color: '#999' }}>
                            {item.time}
                          </span>
                        </Space>
                        {item.status === '已驳回' && (
                          <div style={{ fontSize: '14px', color: '#ff4d4f' }}>
                            驳回原因: {item.reason}
                          </div>
                        )}
                        {item.status === '已通过' && (
                          <div style={{ fontSize: '14px', color: '#52c41a' }}>
                            审核人: {item.auditor}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={24} style={{ marginTop: '24px' }}>
          <Card title="快捷操作" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Card
                  hoverable
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <ApartmentOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '16px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    酒店信息审核
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    审核酒店基础信息
                  </div>
                </Card>
              </Col>

              <Col span={6}>
                <Card
                  hoverable
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <FileTextOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '16px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    上线管理
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    管理酒店上线状态
                  </div>
                </Card>
              </Col>

              <Col span={6}>
                <Card
                  hoverable
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <AuditOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '16px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    Banner 管理
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    管理首页 Banner
                  </div>
                </Card>
              </Col>

              <Col span={6}>
                <Card
                  hoverable
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <ClockCircleOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: '16px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    操作日志
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    查看操作记录
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AuditCenter
