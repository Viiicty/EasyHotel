import { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, Row, Col, Space, message, Upload, Image, Popconfirm, Spin } from 'antd'
import { EditOutlined, PlusOutlined, DeleteOutlined, UploadOutlined, DragOutlined } from '@ant-design/icons'

const { TextArea } = Input
const API_BASE = '/api'

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
        message.success('更新成功')
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

  const handleManageImages = async (hotel) => {
    try {
      console.log('=== handleManageImages ===')
      console.log('Hotel:', hotel)
      setCurrentHotel(hotel)
      setLoading(true)
      const token = getToken()
      const url = `${API_BASE}/hotel-image/hotel/${hotel.id}`
      console.log('Request URL:', url)
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response data:', result)
      if (response.ok) {
        setImageList(result.data || [])
        setImageModalVisible(true)
      } else {
        message.error(result.message || '加载图片失败')
      }
    } catch (error) {
      console.error('Load images error:', error)
      message.error('加载图片失败')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (info) => {
    console.log('=== handleImageUpload ===')
    console.log('Upload info:', info)
    if (info.file.status === 'done') {
      const responseUrl = info.file.response?.data?.url || info.file.response
      console.log('Response URL:', responseUrl)
      if (responseUrl) {
        const newImage = {
          hotelId: currentHotel.id,
          url: responseUrl,
          sortNo: imageList.length,
        }
        console.log('New image data:', newImage)
        const token = getToken()
        const response = await fetch(`${API_BASE}/hotel-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newImage)
        })
        console.log('Create image response status:', response.status)
        const result = await response.json()
        console.log('Create image response data:', result)
        if (response.ok) {
          message.success('图片上传成功')
          handleManageImages(currentHotel)
        } else {
          message.error(result.message || '图片上传失败')
        }
      }
      setUploading(false)
    } else if (info.file.status === 'uploading') {
      setUploading(true)
    } else if (info.file.status === 'error') {
      console.error('Upload error:', info.file.error)
      message.error('图片上传失败')
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imageId) => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch(`${API_BASE}/hotel-image/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        message.success('删除成功')
        handleManageImages(currentHotel)
      } else {
        message.error('删除失败')
      }
    } catch (error) {
      console.error('Delete image error:', error)
      message.error('删除失败')
    } finally {
      setLoading(false)
    }
  }

  const handleImageDragStart = (e, imageId) => {
    setDraggingImageId(imageId)
  }

  const handleImageDragOver = (e) => {
    e.preventDefault()
  }

  const handleImageDrop = async (e, targetImageId) => {
    e.preventDefault()
    if (draggingImageId === targetImageId) {
      return
    }

    const newImageList = [...imageList]
    const draggingIndex = newImageList.findIndex(img => img.id === draggingImageId)
    const targetIndex = newImageList.findIndex(img => img.id === targetImageId)

    if (draggingIndex !== -1 && targetIndex !== -1) {
      const [draggingImage] = newImageList.splice(draggingIndex, 1)
      newImageList.splice(targetIndex, 0, draggingImage)

      const sortOrder = newImageList.map((img, index) => ({
        id: img.id,
        sortNo: index
      }))

      try {
        setLoading(true)
        const token = getToken()
        const response = await fetch(`${API_BASE}/hotel-image/sort-order`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(sortOrder)
        })

        if (response.ok) {
          setImageList(newImageList)
          message.success('排序更新成功')
        } else {
          message.error('排序更新失败')
        }
      } catch (error) {
        console.error('Update sort order error:', error)
        message.error('排序更新失败')
      } finally {
        setLoading(false)
      }
    }

    setDraggingImageId(null)
  }

  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'nameZh',
      key: 'nameZh',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.nameEn}</div>
        </div>
      ),
    },
    {
      title: '城市',
      dataIndex: 'cityCode',
      key: 'cityCode',
      render: (text) => {
        const cityMap = {
          beijing: '北京',
          shanghai: '上海',
          hangzhou: '杭州',
          guangzhou: '广州'
        }
        return cityMap[text] || text
      },
    },
    {
      title: '星级',
      dataIndex: 'starLevel',
      key: 'starLevel',
      render: (level) => {
        const stars = []
        for (let i = 0; i < level; i++) {
          stars.push('⭐')
        }
        return stars.join('')
      },
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
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<UploadOutlined />} onClick={() => handleManageImages(record)}>
            相册
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card title="酒店管理" bordered={false}>
        <Table
          columns={columns}
          dataSource={hotels}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="编辑酒店信息"
        visible={editModalVisible}
        onOk={handleUpdateHotel}
        onCancel={() => setEditModalVisible(false)}
        width={800}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
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
            <Col span={8}>
              <Form.Item
                label="城市"
                name="cityCode"
                rules={[{ required: true, message: '请选择城市' }]}
              >
                <Select placeholder="请选择城市">
                  <Select.Option value="beijing">北京</Select.Option>
                  <Select.Option value="shanghai">上海</Select.Option>
                  <Select.Option value="hangzhou">杭州</Select.Option>
                  <Select.Option value="guangzhou">广州</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
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
            <Col span={8}>
              <Form.Item label="经度" name="lng">
                <Input placeholder="请输入经度" />
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

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="纬度" name="lat">
                <Input placeholder="请输入纬度" />
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

      <Modal
        title="酒店相册管理"
        visible={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        width={1000}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <Upload
            name="file"
            listType="picture-card"
            showUploadList={false}
            action={`${API_BASE}/upload/picture`}
            headers={{
              'Authorization': `Bearer ${getToken()}`
            }}
            onChange={handleImageUpload}
            disabled={uploading}
          >
            {uploading ? (
              <div>上传中...</div>
            ) : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            )}
          </Upload>
        </div>

        <div style={{ marginBottom: 16, color: '#999', fontSize: 12 }}>
          提示：拖拽图片可以调整显示顺序
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {imageList.map((image) => (
            <div
              key={image.id}
              draggable
              onDragStart={(e) => handleImageDragStart(e, image.id)}
              onDragOver={handleImageDragOver}
              onDrop={(e) => handleImageDrop(e, image.id)}
              style={{
                position: 'relative',
                cursor: 'move',
                border: draggingImageId === image.id ? '2px dashed #1890ff' : 'none',
                borderRadius: 8,
                padding: 4
              }}
            >
              <Image
                src={`${API_BASE}/upload/picture/${image.url}`}
                alt={image.url}
                style={{ width: '100%', height: 150, objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: 'rgba(0, 0, 0, 0.6)',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <DragOutlined />
                <span>{image.sortNo + 1}</span>
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                padding: 8,
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <Popconfirm
                  title="确定删除这张图片吗？"
                  onConfirm={() => handleDeleteImage(image.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" size="small" danger style={{ color: '#fff' }}>
                    删除
                  </Button>
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default HotelManage
