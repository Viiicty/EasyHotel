import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, DatePicker, InputNumber, Modal, Form, message, Row, Col, Tag, Select, Empty } from 'antd'
import {
  CalendarOutlined,
  EditOutlined,
  SaveOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { merchantInventoryApi } from '../../api/merchantInventory'

const { RangePicker } = DatePicker

function RoomPrice() {
  console.log('RoomPrice component rendering')
  
  const [loading, setLoading] = useState(false)
  const [hotelLoading, setHotelLoading] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCell, setEditingCell] = useState(null)
  const [form] = Form.useForm()
  const [roomTypes, setRoomTypes] = useState([])
  const [priceData, setPriceData] = useState([])
  const [hotels, setHotels] = useState([])
  const [selectedHotelId, setSelectedHotelId] = useState(null)

  const formatDate = (date) => {
    return date.format('YYYY-MM-DD')
  }

  const formatDay = (date) => {
    return date.format('MM-DD')
  }

  const formatWeekday = (date) => {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.day()]
  }

  const loadHotels = async () => {
    setHotelLoading(true)
    try {
      const hotelsData = await merchantInventoryApi.getHotels()
      setHotels(hotelsData)
      
      const savedHotelId = localStorage.getItem('selectedHotelId')
      if (savedHotelId && hotelsData.some(h => h.hotelId === savedHotelId)) {
        setSelectedHotelId(savedHotelId)
      }
    } catch (error) {
      console.error('Failed to load hotels:', error)
      message.error('加载酒店列表失败')
    } finally {
      setHotelLoading(false)
    }
  }

  const handleHotelChange = (hotelId) => {
    setSelectedHotelId(hotelId)
    localStorage.setItem('selectedHotelId', hotelId)
  }

  const generateDates = () => {
    const dates = []
    const start = selectedDateRange[0]
    const end = selectedDateRange[1]
    let current = start

    while (current.isBefore(end)) {
      dates.push({
        date: formatDate(current),
        day: formatDay(current),
        weekday: formatWeekday(current),
      })
      current = current.add(1, 'day')
    }

    return dates
  }

  const dates = generateDates()

  const buildGrid = (
    roomTypes,
    dates,
    priceMap,
    inventoryMap
  ) => {
    const data = []
    roomTypes.forEach(room => {
      room.ratePlans.forEach(plan => {
        const row = {
          key: plan.ratePlanId,
          roomTypeId: room.roomTypeId,
          roomTypeName: room.roomTypeName,
          ratePlanId: plan.ratePlanId,
          ratePlanName: plan.planName,
          basePrice: plan.basePrice,
          currency: plan.currency,
        }

        dates.forEach(date => {
          const priceKey = `${plan.ratePlanId}_${date.date}`
          const inventoryKey = `${room.roomTypeId}_${date.date}`
          
          const dailyPrice = priceMap.get(priceKey)
          const dailyInventory = inventoryMap.get(inventoryKey)

          const price = dailyPrice?.price ?? plan.basePrice ?? 0
          const totalQty = dailyInventory?.totalQty ?? 0
          const remainQty = dailyInventory?.remainQty ?? 0
          
          const isClosed = totalQty === 0
          const isSoldOut = totalQty > 0 && remainQty === 0

          row[date.date] = {
            price,
            totalQty,
            remainQty,
            isClosed,
            isSoldOut,
          }
        })

        data.push(row)
      })
    })

    return data
  }

  const loadData = async (hotelId) => {
    if (!hotelId) {
      setRoomTypes([])
      setPriceData([])
      return
    }

    setLoading(true)
    try {
      const [roomTypesData] = await Promise.all([
        merchantInventoryApi.getRoomTypes(hotelId),
      ])

      setRoomTypes(roomTypesData)

      if (roomTypesData.length === 0) {
        setPriceData([])
        return
      }

      const roomTypeIds = roomTypesData.map(rt => rt.roomTypeId)
      const ratePlanIds = roomTypesData.flatMap(rt => rt.ratePlans.map(rp => rp.ratePlanId))

      const [pricesData, inventoryData] = await Promise.all([
        merchantInventoryApi.getDailyPrices(
          ratePlanIds,
          formatDate(selectedDateRange[0]),
          formatDate(selectedDateRange[1])
        ),
        merchantInventoryApi.getDailyInventory(
          roomTypeIds,
          formatDate(selectedDateRange[0]),
          formatDate(selectedDateRange[1])
        ),
      ])

      const priceMap = new Map()
      pricesData.forEach(item => {
        priceMap.set(`${item.ratePlanId}_${item.date}`, item)
      })

      const inventoryMap = new Map()
      inventoryData.forEach(item => {
        inventoryMap.set(`${item.roomTypeId}_${item.date}`, item)
      })

      const gridData = buildGrid(roomTypesData, dates, priceMap, inventoryMap)
      setPriceData(gridData)
    } catch (error) {
      console.error('Failed to load data:', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHotels()
  }, [])

  useEffect(() => {
    loadData(selectedHotelId)
  }, [selectedHotelId, selectedDateRange])

  const columns = [
    {
      title: '房型',
      dataIndex: 'roomTypeName',
      key: 'roomType',
      fixed: 'left',
      width: 150,
      render: (text, record, index) => {
        const isFirst = index === 0 || priceData[index - 1]?.roomTypeName !== text
        return isFirst ? (
          <div style={{ fontWeight: 'bold', padding: '8px 0' }}>{text}</div>
        ) : null
      },
    },
    {
      title: '售卖方案',
      dataIndex: 'ratePlanName',
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
      render: (value, record) => {
        if (!value) return null
        
        let statusTag = null
        if (value.isClosed) {
          statusTag = <Tag color="red" style={{ margin: '4px 0 0 0', fontSize: '10px' }}>关房</Tag>
        } else if (value.isSoldOut) {
          statusTag = <Tag color="orange" style={{ margin: '4px 0 0 0', fontSize: '10px' }}>售罄</Tag>
        } else {
          statusTag = <Tag color="green" style={{ margin: '4px 0 0 0', fontSize: '10px' }}>可售</Tag>
        }

        return (
          <div
            style={{
              padding: '8px',
              cursor: 'pointer',
              background: value.isClosed ? '#f5f5f5' : 'transparent',
              opacity: value.isClosed ? 0.5 : 1,
            }}
            onClick={() => handleCellClick(value, date.date, record)}
          >
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>
              ¥{value.price || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              剩余: {value.remainQty || 0}
            </div>
            {statusTag}
          </div>
        )
      },
    })),
  ]

  const handleCellClick = (value, date, record) => {
    setEditingCell({ 
      ...value, 
      date,
      ratePlanId: record.ratePlanId,
      roomTypeId: record.roomTypeId,
    })
    form.setFieldsValue({
      price: value?.price || 0,
      totalQty: value?.totalQty || 0,
      status: value?.isClosed ? 'close' : 'open',
    })
    setIsModalOpen(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      if (!editingCell?.ratePlanId || !editingCell?.roomTypeId) {
        message.error('缺少必要信息')
        return
      }

      setLoading(true)
      
      const updatePricePromise = merchantInventoryApi.updateDailyPrice(
        editingCell.ratePlanId,
        {
          date: editingCell.date,
          price: values.price,
        }
      )

      const updateInventoryPromise = merchantInventoryApi.updateDailyInventory(
        editingCell.roomTypeId,
        {
          date: editingCell.date,
          totalQty: values.totalQty,
        }
      )

      await Promise.all([updatePricePromise, updateInventoryPromise])
      
      message.success('修改成功')
      setIsModalOpen(false)
      await loadData()
    } catch (error) {
      console.error('Failed to update:', error)
      message.error('修改失败')
    } finally {
      setLoading(false)
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
              <Select
                placeholder="请选择酒店"
                style={{ width: 200 }}
                value={selectedHotelId}
                onChange={handleHotelChange}
                loading={hotelLoading}
                allowClear
              >
                {hotels.map(hotel => (
                  <Select.Option key={hotel.hotelId} value={hotel.hotelId}>
                    {hotel.nameZh}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col>
              <RangePicker
                value={selectedDateRange}
                onChange={(dates) => setSelectedDateRange(dates)}
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

          {!selectedHotelId ? (
            <Empty description="请选择酒店后查看房态房价" />
          ) : (
            <Table
              dataSource={priceData}
              columns={columns}
              pagination={false}
              scroll={{ x: 'max-content' }}
              bordered
              size="small"
              loading={loading}
            />
          )}
        </Space>
      </Card>

      <Modal
        title="修改房态房价"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={400}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            price: 0,
            totalQty: 0,
            status: 'open',
          }}
        >
          <Form.Item label="日期">
            <input value={editingCell?.date} disabled style={{ width: '100%', padding: '6px 11px', border: '1px solid #d9d9d9', borderRadius: '2px' }} />
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
            name="totalQty"
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
