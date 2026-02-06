import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, DatePicker, InputNumber, Modal, Form, message, Row, Col, Tag, Input, Select } from 'antd'
import {
  CalendarOutlined,
  EditOutlined,
  SaveOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

const { RangePicker } = DatePicker

function RoomPrice() {
  console.log('RoomPrice component rendering')
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [selectedDateRange, setSelectedDateRange] = useState([startOfMonth, endOfMonth])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCell, setEditingCell] = useState(null)
  const [form] = Form.useForm()

  const roomTypes = [
    {
      key: '1',
      name: '豪华大床房',
      ratePlans: [
        { id: '1-1', name: '含双早-可取消' },
        { id: '1-2', name: '含双早-不可取消' },
      ],
    },
    {
      key: '2',
      name: '标准双床房',
      ratePlans: [
        { id: '2-1', name: '含双早-可取消' },
        { id: '2-2', name: '含双早-不可取消' },
      ],
    },
    {
      key: '3',
      name: '行政套房',
      ratePlans: [
        { id: '3-1', name: '含双早-可取消' },
        { id: '3-2', name: '含双早-不可取消' },
      ],
    },
  ]

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDay = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}-${day}`
  }

  const formatWeekday = (date) => {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.getDay()]
  }

  const generateDates = () => {
    const dates = []
    const start = selectedDateRange[0]
    const end = selectedDateRange[1]
    let current = new Date(start)

    while (current <= end) {
      dates.push({
        date: formatDate(current),
        day: formatDay(current),
        weekday: formatWeekday(current),
      })
      current.setDate(current.getDate() + 1)
    }

    return dates
  }

  const dates = generateDates()

  const generatePriceData = () => {
    const data = []
    roomTypes.forEach(room => {
      room.ratePlans.forEach(plan => {
        const row = {
          key: plan.id,
          roomType: room.name,
          ratePlan: plan.name,
        }

        dates.forEach(date => {
          row[date.date] = {
            price: Math.floor(Math.random() * 500) + 300,
            inventory: Math.floor(Math.random() * 10) + 1,
            status: Math.random() > 0.2 ? 'open' : 'close',
          }
        })

        data.push(row)
      })
    })

    return data
  }

  const priceData = generatePriceData()

  useEffect(() => {
    console.log('RoomPrice component mounted')
  }, [])

  const columns = [
    {
      title: '房型',
      dataIndex: 'roomType',
      key: 'roomType',
      fixed: 'left',
      width: 150,
      render: (text, record, index) => {
        const isFirst = index === 0 || priceData[index - 1]?.roomType !== text
        return isFirst ? (
          <div style={{ fontWeight: 'bold', padding: '8px 0' }}>{text}</div>
        ) : null
      },
    },
    {
      title: '售卖方案',
      dataIndex: 'ratePlan',
      key: 'ratePlan',
      fixed: 'left',
      width: 180,
    },
    ...dates.map(date => ({
      title: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{date.day}</div>
          <div style={{ fontSize: '10px', color: '#999' }}>{date.weekday}</div>
        </div>
      ),
      dataIndex: date.date,
      key: date.date,
      width: 100,
      align: 'center',
      render: (value) => (
        <div
          style={{
            padding: '8px',
            cursor: 'pointer',
            background: value?.status === 'close' ? '#f5f5f5' : 'transparent',
            opacity: value?.status === 'close' ? 0.5 : 1,
          }}
          onClick={() => handleCellClick(value, date.date)}
        >
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>
            ¥{value?.price || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            库存: {value?.inventory || 0}
          </div>
          <Tag
            color={value?.status === 'open' ? 'green' : 'red'}
            style={{ margin: '4px 0 0 0', fontSize: '10px' }}
          >
            {value?.status === 'open' ? '开房' : '关房'}
          </Tag>
        </div>
      ),
    })),
  ]

  const handleCellClick = (value, date) => {
    setEditingCell({ value, date })
    form.setFieldsValue({
      price: value?.price || 0,
      inventory: value?.inventory || 0,
      status: value?.status || 'open',
    })
    setIsModalOpen(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      message.success('修改成功')
      setIsModalOpen(false)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleBatchUpdate = () => {
    message.info('批量更新功能开发中')
  }

  return (
    <div>
      <Card title="房态房价（日历房）" bordered={false}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <RangePicker
                value={selectedDateRange}
                onChange={setSelectedDateRange}
                format="YYYY-MM-DD"
              />
            </Col>
            <Col>
              <Space>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleBatchUpdate}>
                  批量改价
                </Button>
                <Button icon={<SaveOutlined />} onClick={handleBatchUpdate}>
                  批量改库存
                </Button>
                <Button icon={<CloseCircleOutlined />} onClick={handleBatchUpdate}>
                  批量关房
                </Button>
                <Button icon={<CheckCircleOutlined />} onClick={handleBatchUpdate}>
                  批量开房
                </Button>
              </Space>
            </Col>
          </Row>

          <Table
            dataSource={priceData}
            columns={columns}
            pagination={false}
            scroll={{ x: 'max-content' }}
            bordered
            size="small"
          />
        </Space>
      </Card>

      <Modal
        title="修改房态房价"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            price: 0,
            inventory: 0,
            status: 'open',
          }}
        >
          <Form.Item label="日期">
            <Input value={editingCell?.date} disabled />
          </Form.Item>

          <Form.Item
            label="价格"
            name="price"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              min={0}
              precision={0}
              style={{ width: '100%' }}
              prefix="¥"
            />
          </Form.Item>

          <Form.Item
            label="库存"
            name="inventory"
            rules={[{ required: true, message: '请输入库存' }]}
          >
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="状态" name="status">
            <Select>
              <Select.Option value="open">开房</Select.Option>
              <Select.Option value="close">关房</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RoomPrice
