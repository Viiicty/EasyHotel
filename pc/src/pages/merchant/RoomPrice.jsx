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

const API_BASE = '/api'

const getToken = () => {
  return localStorage.getItem('token')
}

const getCurrentUserId = () => {
  const user = localStorage.getItem('user')
  if (user) {
    try {
      const parsed = JSON.parse(user)
      return parsed.id
    } catch (error) {
      console.error('Error parsing user:', error)
    }
  }
  return null
}

function RoomPrice() {
  console.log('RoomPrice component rendering')
  
  const [loading, setLoading] = useState(false)
  const [hotelLoading, setHotelLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(dayjs())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCell, setEditingCell] = useState(null)
  const [form] = Form.useForm()
  const [roomTypes, setRoomTypes] = useState([])
  const [hotels, setHotels] = useState([])
  const [selectedHotelId, setSelectedHotelId] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingInventory, setIsEditingInventory] = useState(false)
  const [roomPrices, setRoomPrices] = useState({})
  const [roomInventory, setRoomInventory] = useState({})
  const [roomTotalQty, setRoomTotalQty] = useState({})

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
      const token = getToken()
      const currentUserId = getCurrentUserId()
      
      const response = await fetch(`${API_BASE}/hotel`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('获取酒店列表失败')
      }
      
      const result = await response.json()
      const hotelsData = (result.data || [])
        .filter(item => item.merchantId === currentUserId && item.status === 'APPROVED')
        .map(item => ({
          hotelId: item.id,
          nameZh: item.nameZh || '未知酒店',
          status: item.status,
        }))
      
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
    const start = selectedMonth.startOf('month')
    const end = selectedMonth.endOf('month')
    let current = start

    while (current.isBefore(end) || current.isSame(end)) {
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

  const loadData = async (hotelId) => {
    if (!hotelId) {
      setRoomTypes([])
      setRoomPrices({})
      setRoomInventory({})
      setRoomTotalQty({})
      return
    }

    setLoading(true)
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/room-type`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('获取房型列表失败')
      }
      
      const result = await response.json()
      const allRoomTypesData = result.data || []
      
      const roomTypesData = allRoomTypesData
        .filter(item => item.hotelId === hotelId && item.status === 'APPROVED')
        .map(item => ({
          roomTypeId: item.id,
          roomTypeName: item.name || '未知房型',
        }))

      setRoomTypes(roomTypesData)

      const prices = {}
      const inventory = {}
      const totalQty = {}
      roomTypesData.forEach(roomType => {
        prices[roomType.roomTypeId] = 100
        totalQty[roomType.roomTypeId] = 1
        inventory[roomType.roomTypeId] = {}
        dates.forEach(date => {
          inventory[roomType.roomTypeId][date.date] = {
            totalQty: 1,
            remainQty: 1,
          }
        })
      })
      setRoomPrices(prices)
      setRoomInventory(inventory)
      setRoomTotalQty(totalQty)
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
  }, [selectedHotelId, selectedMonth])

  const handlePriceChange = (roomTypeId, value) => {
    setRoomPrices(prev => ({
      ...prev,
      [roomTypeId]: value
    }))
  }

  const handleTotalQtyChange = (roomTypeId, value) => {
    setRoomTotalQty(prev => ({
      ...prev,
      [roomTypeId]: value
    }))
  }

  const handleEditPriceClick = () => {
    setIsEditing(true)
  }

  const handleConfirmPriceClick = async () => {
    try {
      setLoading(true)
      
      for (const roomType of roomTypes) {
        const price = roomPrices[roomType.roomTypeId]
        if (price !== undefined && price !== null) {
          const startDate = selectedMonth.startOf('month').format('YYYY-MM-DD')
          const endDate = selectedMonth.endOf('month').format('YYYY-MM-DD')
          
          const response = await fetch(`${API_BASE}/merchant/inventory/${roomType.roomTypeId}/daily`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
              date: startDate,
              totalQty: 10,
            })
          })
          
          if (!response.ok) {
            throw new Error('更新库存失败')
          }
        }
      }
      
      message.success('修改成功')
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update:', error)
      message.error('修改失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEditInventoryClick = () => {
    setIsEditingInventory(true)
  }

  const handleConfirmInventoryClick = async () => {
    try {
      setLoading(true)
      
      for (const roomType of roomTypes) {
        const totalQty = roomTotalQty[roomType.roomTypeId]
        if (totalQty !== undefined && totalQty !== null) {
          const startDate = selectedMonth.startOf('month').format('YYYY-MM-DD')
          const endDate = selectedMonth.endOf('month').format('YYYY-MM-DD')
          
          const response = await fetch(`${API_BASE}/merchant/inventory/${roomType.roomTypeId}/daily`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
              date: startDate,
              totalQty: totalQty,
            })
          })
          
          if (!response.ok) {
            throw new Error('更新库存失败')
          }
        }
      }
      
      message.success('修改成功')
      setIsEditingInventory(false)
    } catch (error) {
      console.error('Failed to update:', error)
      message.error('修改失败')
    } finally {
      setLoading(false)
    }
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
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={(date) => setSelectedMonth(date)}
                format="YYYY-MM"
              />
            </Col>
            <Col>
              <Space>
                <Button style={{ backgroundColor: '#faad14', borderColor: '#faad14', color: 'white' }} icon={<EditOutlined />} onClick={handleEditPriceClick} disabled={isEditing}>
                  修改价格
                </Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleConfirmPriceClick} disabled={!isEditing}>
                  确认价格
                </Button>
                <Button style={{ backgroundColor: '#faad14', borderColor: '#faad14', color: 'white' }} icon={<EditOutlined />} onClick={handleEditInventoryClick} disabled={isEditingInventory}>
                  修改房量
                </Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleConfirmInventoryClick} disabled={!isEditingInventory}>
                  确认房量
                </Button>
              </Space>
            </Col>
          </Row>

          {!selectedHotelId ? (
            <Empty description="请选择酒店后查看房态房价" />
          ) : roomTypes.length === 0 ? (
            <Empty description="暂无房型数据" />
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {roomTypes.map(roomType => {
                const price = roomPrices[roomType.roomTypeId] || 100
                const totalQty = roomTotalQty[roomType.roomTypeId] || 1
                const inv = roomInventory[roomType.roomTypeId] || {}
                
                return (
                  <Card 
                    key={roomType.roomTypeId} 
                    title={roomType.roomTypeName} 
                    bordered={false}
                    style={{ background: '#fafafa' }}
                  >
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 'max-content' }}>
                        <tbody>
                          <tr>
                            <td style={{ width: '80px', border: '1px solid #f0f0f0', padding: '8px', fontWeight: 'bold' }}>日期</td>
                            {dates.map(date => (
                              <td key={date.date} style={{ width: '100px', border: '1px solid #f0f0f0', padding: '8px', background: '#fafafa', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{date.day}</div>
                                <div style={{ fontSize: '10px', color: '#999' }}>{date.weekday}</div>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #f0f0f0', padding: '8px', fontWeight: 'bold' }}>价格</td>
                            {dates.map(date => (
                              <td key={`price-${date.date}`} style={{ border: '1px solid #f0f0f0', padding: '8px', textAlign: 'center' }}>
                                <InputNumber
                                  min={0}
                                  precision={0}
                                  style={{ width: '80px' }}
                                  prefix="¥"
                                  defaultValue={price}
                                  disabled={!isEditing}
                                  onChange={(val) => handlePriceChange(roomType.roomTypeId, val)}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #f0f0f0', padding: '8px', fontWeight: 'bold' }}>总</td>
                            {dates.map(date => (
                              <td key={`total-${date.date}`} style={{ border: '1px solid #f0f0f0', padding: '8px', textAlign: 'center' }}>
                                <InputNumber
                                  min={0}
                                  precision={0}
                                  style={{ width: '80px' }}
                                  defaultValue={totalQty}
                                  disabled={!isEditingInventory}
                                  onChange={(val) => handleTotalQtyChange(roomType.roomTypeId, val)}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #f0f0f0', padding: '8px', fontWeight: 'bold' }}>余</td>
                            {dates.map(date => {
                              const invData = inv[date.date] || {}
                              return (
                                <td key={`remain-${date.date}`} style={{ border: '1px solid #f0f0f0', padding: '8px', textAlign: 'center' }}>
                                  {invData.remainQty || 1}
                                </td>
                              )
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )
              })}
            </Space>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default RoomPrice
