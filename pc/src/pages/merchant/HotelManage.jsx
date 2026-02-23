import { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, Row, Col, Space, message, Upload, Image, Popconfirm, Spin } from 'antd'
import { EditOutlined, PlusOutlined, DeleteOutlined, UploadOutlined, DragOutlined, AimOutlined } from '@ant-design/icons'
import LocationPicker from '../../components/LocationPicker'

const { TextArea } = Input
const API_BASE = '/api'

// 城市列表
const cityOptions = [
  { value: 'beijing', label: '北京' },
  { value: 'shanghai', label: '上海' },
  { value: 'guangzhou', label: '广州' },
  { value: 'shenzhen', label: '深圳' },
  { value: 'hangzhou', label: '杭州' },
  { value: 'chengdu', label: '成都' },
  { value: 'chongqing', label: '重庆' },
  { value: 'wuhan', label: '武汉' },
  { value: 'xian', label: '西安' },
  { value: 'nanjing', label: '南京' },
  { value: 'suzhou', label: '苏州' },
  { value: 'tianjin', label: '天津' },
  { value: 'qingdao', label: '青岛' },
  { value: 'xiamen', label: '厦门' },
  { value: 'dalian', label: '大连' },
  { value: 'sanya', label: '三亚' },
  { value: 'lijiang', label: '丽江' },
  { value: 'guilin', label: '桂林' },
  { value: 'kunming', label: '昆明' },
  { value: 'changsha', label: '长沙' },
  { value: 'zhengzhou', label: '郑州' },
  { value: 'jinan', label: '济南' },
  { value: 'shenyang', label: '沈阳' },
  { value: 'haerbin', label: '哈尔滨' }
]

function HotelManage() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [currentHotel, setCurrentHotel] = useState(null)
  const [form] = Form.useForm()
  const [imageList, setImageList] = useState([])
  const [uploading, setUploading] = useState(false)
  const [draggingImageId, setDraggingImageId] = useState(null)

  const getToken = () => {
    return localStorage.getItem('token')
  }

  const loadHotels = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch(`${API_BASE}/hotel/merchant`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()
      if (response.ok) {
        setHotels(result.data || [])
      } else {
        message.error(result.message || '加载酒店列表失败')
      }
    } catch (error) {
      console.error('Load hotels error:', error)
      message.error('加载酒店列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHotels()
  }, [])

  const handleEdit = (hotel) => {
    setCurrentHotel(hotel)
    form.setFieldsValue({
      nameZh: hotel.nameZh,
      nameEn: hotel.nameEn,
      cityCode: hotel.cityCode,
      starLevel: hotel.starLevel,
      address: hotel.address,
      lat: hotel.lat,
      lng: hotel.lng,
      facilities: hotel.facilities ? hotel.facilities : [],
      tags: hotel.tags ? hotel.tags : [],
      checkInTime: hotel.checkInTime,
      checkOutTime: hotel.checkOutTime,
      cancelPolicy: hotel.cancelPolicy,
      changePolicy: hotel.changePolicy,
      extraBedPolicy: hotel.extraBedPolicy,
    })
    setEditModalVisible(true)
  }

  const handleUpdateHotel = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      const token = getToken()

      const hotelData = {
        nameZh: values.nameZh,
        nameEn: values.nameEn,
        cityCode: values.cityCode,
        starLevel: values.starLevel,
        address: values.address,
        lat: values.lat,
        lng: values.lng,
        facilities: values.facilities ? values.facilities : [],
        tags: values.tags ? values.tags : [],
        checkInTime: values.checkInTime,
        checkOutTime: values.checkOutTime,
        cancelPolicy: values.cancelPolicy,
        changePolicy: values.changePolicy,
        extraBedPolicy: values.extraBedPolicy,
      }

      const response = await fetch(`${API_BASE}/hotel/${currentHotel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hotelData)
      })

      const result = await response.json()

      if (response.ok) {
        message.success('更新酒店信息成功')
        setEditModalVisible(false)
        loadHotels()
      } else {
        message.error(result.message || '更新失败')
      }
    } catch (error) {
      console.error('Update hotel error:', error)
      message.error('更新失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHotel = async (hotelId) => {
    try {
      setLoading(true)
      const token = getToken()

      const response = await fetch(`${API_BASE}/hotel/${hotelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        message.success('删除酒店成功')
        loadHotels()
      } else {
        const result = await response.json()
        message.error(result.message || '删除失败')
      }
    } catch (error) {
      console.error('Delete hotel error:', error)
      message.error('删除失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'nameZh',
      key: 'nameZh',
    },
    {
      title: '城市',
      dataIndex: 'cityCode',
      key: 'cityCode',
      render: (cityCode) => {
        const city = cityOptions.find(c => c.value === cityCode)
        return city ? city.label : cityCode
      }
    },
    {
      title: '星级',
      dataIndex: 'starLevel',
      key: 'starLevel',
      render: (starLevel) => `${starLevel}星级`
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个酒店吗？"
            onConfirm={() => handleDeleteHotel(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card title="酒店管理" bordered={false}>
      <Table
        columns={columns}
        dataSource={hotels}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="编辑酒店"
        open={editModalVisible}
        onOk={handleUpdateHotel}
        onCancel={() => setEditModalVisible(false)}
        width={800}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="酒店名称（中文）"
                name="nameZh"
                rules={[{ required: true, message: '请输入酒店名称' }]}
              >
                <Input placeholder="请输入酒店中文名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="酒店名称（英文）"
                name="nameEn"
                rules={[{ required: true, message: '请输入酒店英文名称' }]}
              >
                <Input placeholder="请输入酒店英文名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="城市"
                name="cityCode"
                rules={[{ required: true, message: '请选择城市' }]}
              >
                <Select placeholder="请选择城市" showSearch optionFilterProp="label">
                  {cityOptions.map(city => (
                    <Select.Option key={city.value} value={city.value} label={city.label}>
                      {city.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="星级"
                name="starLevel"
                rules={[{ required: true, message: '请选择星级' }]}
              >
                <Select placeholder="请选择星级">
                  <Select.Option value={1}>一星级</Select.Option>
                  <Select.Option value={2}>二星级</Select.Option>
                  <Select.Option value={3}>三星级</Select.Option>
                  <Select.Option value={4}>四星级</Select.Option>
                  <Select.Option value={5}>五星级</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="地址"
            name="address"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <TextArea rows={3} placeholder="请输入酒店地址" />
          </Form.Item>

          <Row gutter={[16, 16]} align="middle">
            <Col span={8}>
              <Form.Item label="经度" name="lng">
                <Input placeholder="请输入经度" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="纬度" name="lat">
                <Input placeholder="请输入纬度" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label=" ">
                <LocationPicker 
                  form={form} 
                  fieldNames={{ lat: 'lat', lng: 'lng', city: 'cityCode', address: 'address' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="酒店设施" name="facilities">
            <Select mode="tags" placeholder="请选择酒店设施" style={{ width: '100%' }}>
              <Select.Option value="wifi">免费 WiFi</Select.Option>
              <Select.Option value="parking">免费停车场</Select.Option>
              <Select.Option value="swimming">游泳池</Select.Option>
              <Select.Option value="gym">健身房</Select.Option>
              <Select.Option value="restaurant">餐厅</Select.Option>
              <Select.Option value="spa">SPA</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="快捷标签" name="tags">
            <Select mode="tags" placeholder="请选择快捷标签" style={{ width: '100%' }}>
              <Select.Option value="family">亲子酒店</Select.Option>
              <Select.Option value="luxury">豪华酒店</Select.Option>
              <Select.Option value="business">商务酒店</Select.Option>
              <Select.Option value="airport">近机场</Select.Option>
              <Select.Option value="subway">近地铁</Select.Option>
              <Select.Option value="love">适合情侣</Select.Option>
              <Select.Option value="car">接送机服务</Select.Option>
            </Select>
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="入住时间" name="checkInTime">
                <Input placeholder="请输入入住时间" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="离店时间" name="checkOutTime">
                <Input placeholder="请输入离店时间" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="取消政策" name="cancelPolicy">
            <Select placeholder="请选择取消政策">
              <Select.Option value="free">免费取消</Select.Option>
              <Select.Option value="24h">入住前24小时可取消</Select.Option>
              <Select.Option value="48h">入住前48小时可取消</Select.Option>
              <Select.Option value="none">不可取消</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="修改政策" name="changePolicy">
            <Select placeholder="请选择修改政策">
              <Select.Option value="free">免费修改</Select.Option>
              <Select.Option value="24h">入住前24小时可修改</Select.Option>
              <Select.Option value="48h">入住前48小时可修改</Select.Option>
              <Select.Option value="none">不可修改</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="加床政策" name="extraBedPolicy">
            <Select placeholder="请选择加床政策">
              <Select.Option value="allow">允许免费加床</Select.Option>
              <Select.Option value="charge">允许收费加床</Select.Option>
              <Select.Option value="none">不允许加床</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default HotelManage
