import { Card, Row, Col, Statistic, List, Tag, Space, Badge } from 'antd'
import {
  ApartmentOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'

function Overview() {
  const pendingSubmissions = [
    { id: 1, hotel: '杭州君悦酒店', type: '酒店信息', time: '2小时前', status: '审核中' },
    { id: 2, hotel: '北京瑞吉酒店', type: '房型管理', time: '5小时前', status: '审核中' },
    { id: 3, hotel: '上海浦东香格里拉', type: '房态房价', time: '1天前', status: '已驳回' },
    { id: 4, hotel: '广州白云宾馆', type: '提交记录', time: '2天前', status: '审核中' },
  ]

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

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="今日概览" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="订单数"
                  value={128}
                  prefix={<ApartmentOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="间夜数"
                  value={256}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="GMV"
                  value={45678}
                  prefix="¥"
                  precision={2}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="入住率"
                  value={85}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24} style={{ marginTop: '24px' }}>
          <Card title="近7天趋势" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="总订单"
                  value={892}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="总间夜"
                  value={1784}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="待办事项" bordered={false} style={{ height: '100%' }}>
            <List
              dataSource={pendingSubmissions}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a key="view" style={{ fontSize: '14px' }}>
                      查看 <ArrowRightOutlined />
                    </a>
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
                        <ClockCircleOutlined style={{ fontSize: '12px', color: '#999' }} />
                        <span style={{ fontSize: '14px', color: '#666' }}>{item.time}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="快捷入口" bordered={false} style={{ height: '100%' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Card
                hoverable
                style={{ cursor: 'pointer', textAlign: 'center' }}
                bodyStyle={{ padding: '24px' }}
              >
                <ApartmentOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  维护酒店信息
                </div>
                <div style={{ fontSize: '14px', color: '#999' }}>
                  快速编辑酒店基础信息
                </div>
              </Card>

              <Card
                hoverable
                style={{ cursor: 'pointer', textAlign: 'center' }}
                bodyStyle={{ padding: '24px' }}
              >
                <ClockCircleOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  设置房态房价
                </div>
                <div style={{ fontSize: '14px', color: '#999' }}>
                  批量调整价格和库存
                </div>
              </Card>

              <Card
                hoverable
                style={{ cursor: 'pointer', textAlign: 'center' }}
                bodyStyle={{ padding: '24px' }}
              >
                <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  查看提交记录
                </div>
                <div style={{ fontSize: '14px', color: '#999' }}>
                  跟踪审核进度
                </div>
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Overview
