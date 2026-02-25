import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, message, Image, InputNumber, Upload, Modal, Form, Input, Select } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined
} from '@ant-design/icons'

const API_BASE = '/api'

function BannerManage() {
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadForm] = Form.useForm()
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [hotelOptions, setHotelOptions] = useState([])

  const getToken = () => {
    return localStorage.getItem('token')
  }

  const fetchApprovedHotels = async () => {
    try {
      const token = getToken()
      console.log('Fetching approved hotels...')
      const response = await fetch(`${API_BASE}/hotel/approved`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response data:', result)
      
      if (response.ok) {
        const hotels = result.data || result || []
        console.log('Hotels:', hotels)
        const options = hotels.map(hotel => ({
          label: hotel.nameZh || hotel.hotelName,
          value: hotel.id
        }))
        console.log('Hotel options:', options)
        setHotelOptions(options)
      } else {
        console.error('Failed to fetch approved hotels:', result)
        message.error('获取酒店列表失败')
      }
    } catch (error) {
      console.error('Error fetching approved hotels:', error)
      message.error('获取酒店列表失败')
    }
  }

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片!')
      return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB!')
      return false
    }
    return true
  }

  const handleImageChange = (info) => {
    if (info.file.status === 'done') {
      const responseUrl = info.file.response?.filename || info.file.response?.data?.url || info.file.response
      if (responseUrl) {
        setImageUrl(responseUrl)
        uploadForm.setFieldsValue({ coverImage: responseUrl })
        message.success('图片上传成功')
      }
      setUploading(false)
    } else if (info.file.status === 'uploading') {
      setUploading(true)
    } else if (info.file.status === 'error') {
      message.error('图片上传失败')
      setUploading(false)
    }
  }

  const handleUploadSubmit = async () => {
    try {
      const values = await uploadForm.validateFields()
      const token = getToken()
      
      const response = await fetch(`${API_BASE}/home-banner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coverImage: values.coverImage,
          hotelId: values.hotelId,
          status: 'DOWN',
          sortNo: 1
        })
      })

      if (response.ok) {
        message.success('Banner创建成功')
        setUploadModalOpen(false)
        uploadForm.resetFields()
        setImageUrl('')
        fetchBanners()
      } else {
        message.error('Banner创建失败')
      }
    } catch (error) {
      console.error('Upload submit error:', error)
      message.error('网络错误')
    }
  }

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/home-banner`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        const formattedData = (result.data || []).map(item => ({
          key: item.id,
          id: item.id,
          cityCode: item.cityCode,
          coverImage: item.coverImage,
          hotelId: item.hotel?.id,
          hotelName: item.hotel?.nameZh || '-',
          startAt: item.startAt,
          endAt: item.endAt,
          status: item.status,
          sortNo: item.sortNo,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy,
        }))
        setDataSource(formattedData)
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
      message.error('获取Banner列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
    fetchApprovedHotels()
  }, [])

  const handleOnline = async (record) => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/home-banner/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'UP' })
      })
      
      if (response.ok) {
        message.success('上线成功')
        fetchBanners()
      } else {
        message.error('上线失败')
      }
    } catch (error) {
      console.error('Online error:', error)
      message.error('网络错误')
    }
  }

  const handleOffline = async (record) => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/home-banner/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'DOWN', sortNo: null })
      })
      
      if (response.ok) {
        message.success('下线成功')
        fetchBanners()
      } else {
        message.error('下线失败')
      }
    } catch (error) {
      console.error('Offline error:', error)
      message.error('网络错误')
    }
  }

  const handleSortChange = async (record, value) => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/home-banner/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sortNo: value })
      })
      
      if (response.ok) {
        message.success('排序修改成功')
        fetchBanners()
      } else {
        message.error('排序修改失败')
      }
    } catch (error) {
      console.error('Sort change error:', error)
      message.error('网络错误')
    }
  }

  const columns = [
    {
      title: '封面图片',
      dataIndex: 'coverImage',
      key: 'coverImage',
      width: 200,
      render: (coverImage) => coverImage ? (
        <Image
          width={200}
          height={100}
          src={`${API_BASE}/upload/banner/${coverImage}`}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
        />
      ) : '-',
    },
    {
      title: '关联酒店',
      dataIndex: 'hotelName',
      key: 'hotelName',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'UP' ? 'green' : 'default'} style={{ fontSize: '16px' }}>
          {status === 'UP' ? '上线' : '下线'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortNo',
      key: 'sortNo',
      width: 200,
      render: (sortNo, record) => {
        const handleChange = (value) => {
          if (value > 4) {
            message.warning('超出范围')
            return
          }
          handleSortChange(record, value)
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InputNumber
              min={1}
              max={3}
              value={sortNo}
              onChange={handleChange}
              disabled={record.status !== 'UP'}
              style={{ width: '80px' }}
            />
          </div>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<ArrowUpOutlined />}
            style={{ color: record.status === 'UP' ? '#1890ff' : undefined, fontSize: '16px' }}
            onClick={() => handleOnline(record)}
            disabled={record.status === 'UP'}
          >
            上线
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<ArrowDownOutlined />}
            style={{ fontSize: '16px' }}
            onClick={() => handleOffline(record)}
            disabled={record.status === 'DOWN'}
          >
            下线
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="首页 Banner 管理"
        bordered={false}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              fetchApprovedHotels()
              setUploadModalOpen(true)
            }}
          >
            新建 Banner
          </Button>
        }
      >
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title="新建 Banner"
        open={uploadModalOpen}
        onCancel={() => {
          setUploadModalOpen(false)
          uploadForm.resetFields()
          setImageUrl('')
        }}
        onOk={handleUploadSubmit}
        confirmLoading={uploading}
        width={600}
        destroyOnClose
      >
        <Form
          form={uploadForm}
          layout="vertical"
        >
          <Form.Item
            label="封面图片"
            name="coverImage"
            rules={[{ required: true, message: '请上传封面图片' }]}
          >
            <Upload
              name="file"
              listType="picture-card"
              className="banner-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleImageChange}
              action={`${API_BASE}/upload/banner`}
              headers={{
                'Authorization': `Bearer ${getToken()}`
              }}
            >
              {uploading ? (
                <div>
                  <div className="ant-upload-text">上传中...</div>
                </div>
              ) : imageUrl ? (
                <img
                  src={`${API_BASE}/upload/banner/${imageUrl}`}
                  alt="banner"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label="关联酒店"
            name="hotelId"
            rules={[{ required: true, message: '请选择酒店' }]}
          >
            <Select 
              placeholder="请选择酒店"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {hotelOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>


        </Form>
      </Modal>
    </div>
  )
}

export default BannerManage
