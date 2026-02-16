import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, DatePicker, InputNumber, Modal, Form, message, Row, Col, Tag, Empty, Spin, Select } from 'antd'
import {
  CalendarOutlined,
  EditOutlined,
  SaveOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { merchantInventoryApi } from '../../api/merchantInventory'

const { RangePicker } = DatePicker
const { Option } = Select

function RoomPrice() {
  const [loading, setLoading] = useState(false)
  const [hotelLoading, setHotelLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(dayjs())
  const [hotels, setHotels] = useState([])
  const [selectedHotelId, setSelectedHotelId] = useState(null)
  const [roomTypes, setRoomTypes] = useState([])
  const [prices, setPrices] = useState({})
  const [inventory, setInventory] = useState({})
  const [editingPrices, setEditingPrices] = useState({})
  const [editingInventory, setEditingInventory] = useState({})
  const [originalPrices, setOriginalPrices] = useState({})
  const [originalInventory, setOriginalInventory] = useState({})
  const [editMode, setEditMode] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [isDefaultModalOpen, setIsDefaultModalOpen] = useState(false)
  const [currentRoomType, setCurrentRoomType] = useState(null)
  const [defaultForm] = Form.useForm()
  const [priceZeroConfirmVisible, setPriceZeroConfirmVisible] = useState(false)

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

  const isWeekend = (date) => {
    const day = date.day()
    return day === 0 || day === 6
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
        isWeekend: isWeekend(current)
      })
      current = current.add(1, 'day')
    }

    return dates
  }

  const dates = generateDates()

  const loadHotels = async () => {
    setHotelLoading(true)
    try {
      console.log('=== 开始加载酒店列表 ===')
      const hotelsData = await merchantInventoryApi.getHotels()
      console.log('=== 酒店列表数据 ===', hotelsData)
      setHotels(hotelsData)
      
      const savedHotelId = localStorage.getItem('selectedHotelId')
      console.log('=== 本地存储的酒店ID ===', savedHotelId)
      if (savedHotelId && hotelsData.some(hotel => hotel.id === savedHotelId)) {
        console.log('=== 自动选择酒店 ===', savedHotelId)
        setSelectedHotelId(savedHotelId)
      }
    } catch (error) {
      console.error('=== 加载酒店列表失败 ===', error)
      message.error('加载酒店列表失败')
    } finally {
      setHotelLoading(false)
    }
  }

  const handleHotelChange = (hotelId) => {
    console.log('=== 酒店选择变化 ===', hotelId)
    setSelectedHotelId(hotelId)
    if (hotelId) {
      localStorage.setItem('selectedHotelId', hotelId)
    } else {
      localStorage.removeItem('selectedHotelId')
    }
  }

  const loadData = async () => {
    if (!selectedHotelId) {
      console.log('=== 未选择酒店，跳过加载 ===')
      setRoomTypes([])
      setPrices({})
      setInventory({})
      return
    }

    setLoading(true)
    try {
      console.log('=== 开始加载房型列表，酒店ID ===', selectedHotelId)
      const roomTypesData = await merchantInventoryApi.getRoomTypes(selectedHotelId)
      console.log('=== 房型列表数据 ===', roomTypesData)
      console.log('=== 房型数据详情 ===', roomTypesData.map(rt => ({
        id: rt.id,
        name: rt.name,
        全部字段: rt
      })))
      setRoomTypes(roomTypesData)

      if (roomTypesData.length === 0) {
        console.log('=== 无房型数据 ===')
        setPrices({})
        setInventory({})
        return
      }

      const startDate = selectedMonth.startOf('month').format('YYYY-MM-DD')
      const endDate = selectedMonth.endOf('month').format('YYYY-MM-DD')
      console.log('=== 日期范围 ===', startDate, '至', endDate)

      console.log('=== 开始加载价格数据 ===')
      const pricesData = await merchantInventoryApi.getDailyPrices(selectedHotelId, startDate, endDate)
      console.log('=== 价格数据 ===', pricesData)

      console.log('=== 开始加载库存数据 ===')
      const inventoryData = await merchantInventoryApi.getDailyInventory(
        roomTypesData.map(rt => rt.id),
        startDate,
        endDate
      )
      console.log('=== 库存数据 ===', inventoryData)

      const pricesMap = {}
      const inventoryMap = {}
      
      roomTypesData.forEach(roomType => {
        pricesMap[roomType.id] = {}
        inventoryMap[roomType.id] = {}
        
        dates.forEach(date => {
          const priceData = pricesData.find(p => {
            const priceDate = p.date instanceof Date ? p.date.toISOString().split('T')[0] : String(p.date).split('T')[0]
            return p.roomTypeId === roomType.id && priceDate === date.date
          })
          pricesMap[roomType.id][date.date] = priceData ? {
            price: priceData.price,
            isDefault: priceData.isDefault
          } : {
            price: null,
            isDefault: true
          }

          const invData = inventoryData.find(i => {
            const invDate = i.date instanceof Date ? i.date.toISOString().split('T')[0] : String(i.date).split('T')[0]
            return i.roomTypeId === roomType.id && invDate === date.date
          })
          inventoryMap[roomType.id][date.date] = invData ? {
            totalQty: invData.totalQty,
            usedQty: invData.usedQty,
            holdQty: invData.holdQty,
            remainQty: invData.remainQty,
            isDefault: invData.isDefault
          } : {
            totalQty: null,
            usedQty: null,
            holdQty: 0,
            remainQty: null,
            isDefault: true
          }
        })
      })

      console.log('=== 处理后的价格Map ===', pricesMap)
      console.log('=== 处理后的库存Map ===', inventoryMap)

      setPrices(pricesMap)
      setInventory(inventoryMap)
      setEditingPrices({})
      setEditingInventory({})
      setHasChanges(false)
      console.log('=== 数据加载完成 ===')
    } catch (error) {
      console.error('=== 加载数据失败 ===', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHotels()
  }, [])

  useEffect(() => {
    loadData()
  }, [selectedHotelId, selectedMonth])

  const handlePriceChange = (roomTypeId, date, value) => {
    setEditingPrices(prev => ({
      ...prev,
      [roomTypeId]: {
        ...(prev[roomTypeId] || {}),
        [date]: value
      }
    }))
    setHasChanges(true)
  }

  const handleInventoryChange = (roomTypeId, date, value) => {
    setEditingInventory(prev => ({
      ...prev,
      [roomTypeId]: {
        ...(prev[roomTypeId] || {}),
        [date]: value
      }
    }))
    setHasChanges(true)
  }

  const handleOpenDefaultModal = (roomType) => {
    setCurrentRoomType(roomType)
    defaultForm.setFieldsValue({
      defaultPrice: roomType.defaultPrice || 0,
      defaultInventory: roomType.defaultInventory || 0
    })
    setIsDefaultModalOpen(true)
  }

  const handleDefaultModalOk = async () => {
    try {
      const values = await defaultForm.validateFields()
      setLoading(true)
      
      await merchantInventoryApi.updateDefaultPrice(currentRoomType.id, values.defaultPrice)
      await merchantInventoryApi.updateDefaultInventory(currentRoomType.id, values.defaultInventory)
      
      message.success('默认值设置成功')
      setIsDefaultModalOpen(false)
      setCurrentRoomType(null)
      await loadData()
    } catch (error) {
      console.error('设置默认值失败:', error)
      message.error('设置默认值失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDefaultModalCancel = () => {
    setIsDefaultModalOpen(false)
    setCurrentRoomType(null)
  }

  const handleEditPriceClick = () => {
    const newEditingPrices = {}
    roomTypes.forEach(roomType => {
      newEditingPrices[roomType.id] = {}
      dates.forEach(date => {
        const priceData = prices[roomType.id]?.[date.date]
        const defaultPrice = roomType.defaultPrice || 0
        newEditingPrices[roomType.id][date.date] = priceData?.isDefault ? defaultPrice : (priceData?.price ?? defaultPrice)
      })
    })
    setEditingPrices(newEditingPrices)
    setOriginalPrices(JSON.parse(JSON.stringify(prices)))
    setEditMode('price')
    setHasChanges(true)
  }

  const handleEditInventoryClick = () => {
    const newEditingInventory = {}
    roomTypes.forEach(roomType => {
      newEditingInventory[roomType.id] = {}
      dates.forEach(date => {
        const inventoryData = inventory[roomType.id]?.[date.date]
        const defaultInventory = roomType.defaultInventory || 0
        newEditingInventory[roomType.id][date.date] = inventoryData?.isDefault ? defaultInventory : (inventoryData?.totalQty ?? defaultInventory)
      })
    })
    setEditingInventory(newEditingInventory)
    setOriginalInventory(JSON.parse(JSON.stringify(inventory)))
    setEditMode('inventory')
    setHasChanges(true)
  }

  const handleCancelClick = () => {
    setEditMode(null)
    setEditingPrices({})
    setEditingInventory({})
    setOriginalPrices({})
    setOriginalInventory({})
    setHasChanges(false)
  }

  const handleSaveClick = async () => {
    if (!hasChanges) {
      message.info('没有修改需要保存')
      return
    }

    setLoading(true)
    try {
      let updateCount = 0
      let hasZeroPrice = false
      let zeroPriceRoomType = ''

      if (editMode === 'price') {
        for (const roomType of roomTypes) {
          const roomTypePrices = editingPrices[roomType.id] || {}
          const roomTypeOriginalPrices = originalPrices[roomType.id] || {}
          
          for (const [date, price] of Object.entries(roomTypePrices)) {
            const originalPriceData = roomTypeOriginalPrices[date]
            const originalPrice = originalPriceData?.isDefault ? null : (originalPriceData?.price ?? null)
            
            if (price !== undefined && price !== null && price !== originalPrice) {
              if (price === 0) {
                hasZeroPrice = true
                zeroPriceRoomType = roomType.name
              }
            }
          }
        }
        
        if (hasZeroPrice) {
          setPriceZeroConfirmVisible(true)
          setLoading(false)
          return
        }

        for (const roomType of roomTypes) {
          const roomTypePrices = editingPrices[roomType.id] || {}
          const roomTypeOriginalPrices = originalPrices[roomType.id] || {}
          
          for (const [date, price] of Object.entries(roomTypePrices)) {
            const originalPriceData = roomTypeOriginalPrices[date]
            const originalPrice = originalPriceData?.price ?? null
            
            let shouldUpdate = false
            if (originalPrice === null) {
              shouldUpdate = true
            } else {
              shouldUpdate = price !== originalPrice
            }
            
            if (shouldUpdate) {
              await merchantInventoryApi.batchUpdatePrices(
                selectedHotelId,
                roomType.id,
                date,
                date,
                price
              )
              updateCount++
            }
          }
        }
      } else if (editMode === 'inventory') {
        for (const roomType of roomTypes) {
          const roomTypeInventory = editingInventory[roomType.id] || {}
          const roomTypeOriginalInventory = originalInventory[roomType.id] || {}
          
          for (const [date, totalQty] of Object.entries(roomTypeInventory)) {
            const originalInventoryData = roomTypeOriginalInventory[date]
            const originalQty = originalInventoryData?.totalQty ?? null
            
            let shouldUpdate = false
            if (originalQty === null) {
              shouldUpdate = true
            } else {
              shouldUpdate = totalQty !== originalQty
            }
            
            if (shouldUpdate) {
              await merchantInventoryApi.updateDailyInventory(roomType.id, date, totalQty)
              updateCount++
            }
          }
        }
      }

      message.success(`保存成功，共更新 ${updateCount} 条数据`)
      setHasChanges(false)
      setEditMode(null)
      setEditingPrices({})
      setEditingInventory({})
      setOriginalPrices({})
      setOriginalInventory({})
      await loadData()
    } catch (error) {
      console.error('Failed to save:', error)
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePriceZeroConfirm = async () => {
    setPriceZeroConfirmVisible(false)
    setLoading(true)
    try {
      let updateCount = 0

      for (const roomType of roomTypes) {
        const roomTypePrices = editingPrices[roomType.id] || {}
        const roomTypeOriginalPrices = originalPrices[roomType.id] || {}
        
        for (const [date, price] of Object.entries(roomTypePrices)) {
          const originalPriceData = roomTypeOriginalPrices[date]
          const originalPrice = originalPriceData?.price ?? null
          
          let shouldUpdate = false
          if (originalPrice === null) {
            shouldUpdate = true
          } else {
            shouldUpdate = price !== originalPrice
          }
          
          if (shouldUpdate) {
            await merchantInventoryApi.batchUpdatePrices(
              selectedHotelId,
              roomType.id,
              date,
              date,
              price
            )
            updateCount++
          }
        }
      }

      message.success(`保存成功，共更新 ${updateCount} 条数据`)
      setHasChanges(false)
      setEditMode(null)
      setEditingPrices({})
      setEditingInventory({})
      setOriginalPrices({})
      setOriginalInventory({})
      await loadData()
    } catch (error) {
      console.error('Failed to save:', error)
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePriceZeroCancel = () => {
    setPriceZeroConfirmVisible(false)
  }

  const getDisplayPrice = (roomTypeId, date) => {
    if (editMode === 'price' && editingPrices[roomTypeId]?.[date] !== undefined) {
      return editingPrices[roomTypeId][date]
    }
    const priceData = prices[roomTypeId]?.[date]
    if (!priceData || priceData.price === null) {
      return '-'
    }
    return priceData.price
  }

  const getDisplayInventory = (roomTypeId, date) => {
    if (editMode === 'inventory' && editingInventory[roomTypeId]?.[date] !== undefined) {
      return editingInventory[roomTypeId][date]
    }
    const inventoryData = inventory[roomTypeId]?.[date]
    if (!inventoryData || inventoryData.totalQty === null) {
      return '-'
    }
    return inventoryData.totalQty
  }

  const getCellBackgroundColor = (date, isWeekend) => {
    if (isWeekend) {
      return '#f5f5f5'
    }
    return '#ffffff'
  }

  const getRemainQtyColor = (remainQty) => {
    if (remainQty <= 0) return '#ff4d4f'
    if (remainQty < 5) return '#faad14'
    return '#52c41a'
  }

  const getUsedQtyColor = (usedQty, totalQty) => {
    if (totalQty === 0) return '#999999'
    const ratio = usedQty / totalQty
    return ratio < 0.5 ? '#52c41a' : '#ff4d4f'
  }

  return (
    <div>
      <Card title="房态房价管理" bordered={false}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <Space>
                <span>酒店：</span>
                <Select
                  placeholder="请选择酒店"
                  style={{ width: 250 }}
                  value={selectedHotelId}
                  onChange={handleHotelChange}
                  loading={hotelLoading}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {hotels.map(hotel => (
                    <Option key={hotel.id} value={hotel.id}>
                      {hotel.nameZh}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col>
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={(date) => setSelectedMonth(date)}
                format="YYYY-MM"
                style={{ width: 150 }}
              />
            </Col>
            <Col>
              <Space>
                {editMode === null && (
                  <>
                    <Button icon={<EditOutlined />} onClick={handleEditPriceClick}>
                      编辑价格
                    </Button>
                    <Button icon={<EditOutlined />} onClick={handleEditInventoryClick}>
                      编辑库存
                    </Button>
                  </>
                )}
                {editMode !== null && (
                  <>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveClick} disabled={!hasChanges}>
                      保存
                    </Button>
                    <Button icon={<CloseCircleOutlined />} onClick={handleCancelClick}>
                      取消
                    </Button>
                  </>
                )}
                <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
                  刷新
                </Button>
              </Space>
            </Col>
          </Row>

          {!selectedHotelId ? (
            <Empty description="请选择酒店后查看房态房价" />
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : roomTypes.length === 0 ? (
            <Empty description="暂无房型数据" />
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {roomTypes.map(roomType => {
                return (
                  <Card 
                    key={roomType.id} 
                    bordered={false}
                    style={{ background: '#fafafa' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{roomType.name}</span>
                      <Space>
                        <Button 
                          size="small" 
                          icon={<EditOutlined />}
                          onClick={() => handleOpenDefaultModal(roomType)}
                        >
                          设置默认值
                        </Button>
                      </Space>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 'max-content' }}>
                        <tbody>
                          <tr>
                            <td style={{ width: '80px', border: '1px solid #f0f0f0', padding: '8px', fontWeight: 'bold', background: '#fafafa' }}>日期</td>
                            {dates.map(date => (
                              <td 
                                key={date.date} 
                                style={{ 
                                  width: '100px', 
                                  border: '1px solid #f0f0f0', 
                                  padding: '8px', 
                                  background: getCellBackgroundColor(date.date, date.isWeekend),
                                  textAlign: 'center' 
                                }}
                              >
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{date.day}</div>
                                <div style={{ fontSize: '10px', color: '#999' }}>{date.weekday}</div>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #f0f0f0', padding: '8px', fontWeight: 'bold', background: '#fafafa' }}>价格</td>
                            {dates.map(date => {
                              const price = getDisplayPrice(roomType.id, date.date)
                              const isEditing = editMode === 'price'
                              const hasChange = editingPrices[roomType.id]?.[date.date] !== undefined
                              
                              return (
                                <td 
                                  key={`price-${date.date}`} 
                                  style={{ 
                                    border: '1px solid #f0f0f0', 
                                    padding: '8px', 
                                    textAlign: 'center',
                                    background: hasChange ? '#e6f7ff' : getCellBackgroundColor(date.date, date.isWeekend)
                                  }}
                                >
                                  {isEditing ? (
                                    <InputNumber
                                      min={0}
                                      precision={0}
                                      style={{ width: '80px' }}
                                      prefix="¥"
                                      value={price === '-' ? undefined : price}
                                      disabled={!isEditing}
                                      onChange={(val) => handlePriceChange(roomType.id, date.date, val)}
                                    />
                                  ) : (
                                    <span style={{ color: price === '-' ? '#999' : 'inherit' }}>
                                      {price === '-' ? '-' : `¥${price}`}
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #f0f0f0', padding: '8px', fontWeight: 'bold', background: '#fafafa' }}>总库存</td>
                            {dates.map(date => {
                              const totalQty = getDisplayInventory(roomType.id, date.date)
                              const isEditing = editMode === 'inventory'
                              const hasChange = editingInventory[roomType.id]?.[date.date] !== undefined
                              
                              return (
                                <td 
                                  key={`total-${date.date}`} 
                                  style={{ 
                                    border: '1px solid #f0f0f0', 
                                    padding: '8px', 
                                    textAlign: 'center',
                                    background: hasChange ? '#e6f7ff' : getCellBackgroundColor(date.date, date.isWeekend)
                                  }}
                                >
                                  {isEditing ? (
                                    <InputNumber
                                      min={0}
                                      precision={0}
                                      style={{ width: '80px' }}
                                      value={totalQty === '-' ? undefined : totalQty}
                                      disabled={!isEditing}
                                      onChange={(val) => handleInventoryChange(roomType.id, date.date, val)}
                                    />
                                  ) : (
                                    <span style={{ color: totalQty === '-' ? '#999' : 'inherit' }}>
                                      {totalQty}
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #f0f0f0', padding: '8px', fontWeight: 'bold', background: '#fafafa' }}>已用</td>
                            {dates.map(date => {
                              const invData = inventory[roomType.id]?.[date.date] || {}
                              const usedQty = invData.usedQty
                              const totalQty = invData.totalQty
                              const displayUsedQty = usedQty !== null ? usedQty : '-'
                              return (
                                <td 
                                  key={`used-${date.date}`} 
                                  style={{ 
                                    border: '1px solid #f0f0f0', 
                                    padding: '8px', 
                                    textAlign: 'center',
                                    color: usedQty !== null && totalQty !== null ? getUsedQtyColor(usedQty, totalQty) : '#999',
                                    fontWeight: 'bold',
                                    background: getCellBackgroundColor(date.date, date.isWeekend)
                                  }}
                                >
                                  {displayUsedQty}
                                </td>
                              )
                            })}
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #f0f0f0', padding: '8px', fontWeight: 'bold', background: '#fafafa' }}>锁定</td>
                            {dates.map(date => {
                              const invData = inventory[roomType.id]?.[date.date] || {}
                              const holdQty = invData.holdQty
                              const displayHoldQty = holdQty !== null ? holdQty : '-'
                              return (
                                <td 
                                  key={`hold-${date.date}`} 
                                  style={{ 
                                    border: '1px solid #f0f0f0', 
                                    padding: '8px', 
                                    textAlign: 'center',
                                    color: holdQty !== null ? '#faad14' : '#999',
                                    fontWeight: 'bold',
                                    background: getCellBackgroundColor(date.date, date.isWeekend)
                                  }}
                                >
                                  {displayHoldQty}
                                </td>
                              )
                            })}
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #f0f0f0', padding: '8px', fontWeight: 'bold', background: '#fafafa' }}>剩余</td>
                            {dates.map(date => {
                              const invData = inventory[roomType.id]?.[date.date] || {}
                              const remainQty = invData.remainQty
                              const displayRemainQty = remainQty !== null ? remainQty : '-'
                              return (
                                <td 
                                  key={`remain-${date.date}`} 
                                  style={{ 
                                    border: '1px solid #f0f0f0', 
                                    padding: '8px', 
                                    textAlign: 'center',
                                    color: remainQty !== null ? getRemainQtyColor(remainQty) : '#999',
                                    fontWeight: 'bold',
                                    background: getCellBackgroundColor(date.date, date.isWeekend)
                                  }}
                                >
                                  {displayRemainQty}
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

      <Modal
        title="设置默认值"
        open={isDefaultModalOpen}
        onOk={handleDefaultModalOk}
        onCancel={handleDefaultModalCancel}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form form={defaultForm} layout="vertical">
          <Form.Item 
            name="defaultPrice" 
            label="默认价格（元）"
            rules={[
              { required: true, message: '请输入默认价格' },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null || value === '') {
                    return Promise.reject('请输入默认价格');
                  }
                  if (Number(value) < 0) {
                    return Promise.reject('价格不能小于0');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber 
              min={0} 
              precision={0} 
              style={{ width: '100%' }} 
              prefix="¥"
              placeholder="请输入默认价格"
            />
          </Form.Item>
          <Form.Item 
            name="defaultInventory" 
            label="默认库存量"
            rules={[
              { required: true, message: '请输入默认库存' },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null || value === '') {
                    return Promise.reject('请输入默认库存');
                  }
                  if (Number(value) < 0) {
                    return Promise.reject('库存不能小于0');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber 
              min={0} 
              precision={0} 
              style={{ width: '100%' }} 
              placeholder="请输入默认库存"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="确认更改"
        open={priceZeroConfirmVisible}
        onOk={handlePriceZeroConfirm}
        onCancel={handlePriceZeroCancel}
        okText="确认更改"
        cancelText="取消"
        width={400}
      >
        <p style={{ fontSize: '16px', marginBottom: '16px' }}>
          有房型价格为0，确认更改？
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          注意：默认值只写入房型表，用于该房型从未设置过价格的日期
        </p>
      </Modal>
    </div>
  )
}

export default RoomPrice
