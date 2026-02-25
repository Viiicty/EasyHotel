import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Drawer, InputNumber, Checkbox, AutoComplete, Upload, Image } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  CopyOutlined,
  StopOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  SendOutlined,
  DeleteOutlined,
  DragOutlined
} from '@ant-design/icons'

function RoomType() {
  const [hotels, setHotels] = useState([])
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [dataSource, setDataSource] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [hotelsLoading, setHotelsLoading] = useState(true)
  const [apiError, setApiError] = useState(null)
  const [roomTypesError, setRoomTypesError] = useState(null)
  const [fileList, setFileList] = useState([])
  const [uploading, setUploading] = useState(false)
  const [roomPictures, setRoomPictures] = useState([])

  const getToken = () => {
    return localStorage.getItem('token')
  }

  useEffect(() => {
    console.log('RoomType component mounted')
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    setHotelsLoading(true)
    setApiError(null)
    try {
      const token = getToken()
      console.log('token:', token)
      const response = await fetch(`/api/merchant/hotels`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const { data: result } = await response.json()
        setHotels(result || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', response.status, errorData)
        setApiError(`获取酒店列表失败 (${response.status})`)
        message.error(errorData.message || '获取酒店列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch hotels:', error)
      setApiError('网络错误，无法连接到服务器')
      message.error('网络错误，请检查后端服务是否启动')
    } finally {
      setHotelsLoading(false)
    }
  }

  const fetchRoomTypes = async (hotelId) => {
    setLoading(true)
    setRoomTypesError(null)
    try {
      const token = getToken()
      const response = await fetch(`/api/room-type/hotel/${hotelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const { data: result } = await response.json()
        setDataSource(result || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', response.status, errorData)
        setRoomTypesError(`获取房型列表失败 (${response.status})`)
        message.error(errorData.message || '获取房型列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch room types:', error)
      setRoomTypesError('网络错误，请检查后端服务是否启动')
      message.error('网络错误，请检查后端服务是否启动')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoomPictures = async (roomTypeId) => {
    try {
      const response = await fetch(`/api/roomtype-picture/room-type/${roomTypeId}`)
      if (response.ok) {
        const result = await response.json()
        console.log('fetchRoomPictures result:', result);
        const pictures = result.data || result || []
        setRoomPictures(pictures)
        const files = pictures.map((pic, index) => ({
          uid: pic.id || `-${index}`,
          name: `图片${index + 1}`,
          status: 'done',
          url: `/api/upload/roompicture/${pic.url}`,
          response: { filename: pic.url }
        }))
        setFileList(files)
      }
    } catch (error) {
      console.error('Failed to fetch room pictures:', error)
    }
  }

  const handleSearch = (value) => {
    setSearchValue(value)
  }

  const handleSelectHotel = (hotelId) => {
    const hotel = hotels.find(hotel => hotel.id === hotelId)
    setSelectedHotel(hotel)
    message.success(`已选择酒店：${hotel?.nameZh}`)
    if (hotel) {
      fetchRoomTypes(hotel.id)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'default'
      case 'PENDING':
        return 'processing'
      case 'APPROVED':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'DRAFT':
        return '草稿'
      case 'PENDING':
        return '待审核'
      case 'APPROVED':
        return '已通过'
      default:
        return status
    }
  }

  const columns = [
    {
      title: '房型名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '面积（㎡）',
      dataIndex: 'areaSqm',
      key: 'areaSqm',
      width: 120,
    },
    {
      title: '床型',
      dataIndex: 'bedType',
      key: 'bedType',
      width: 100,
    },
    {
      title: '可住人数',
      dataIndex: 'maxGuests',
      key: 'maxGuests',
      width: 100,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '最后修改时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date) => date ? new Date(date).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === 'DRAFT' && (
            <Button
              type="link"
              size="small"
              icon={<SendOutlined />}
              onClick={() => handleSubmitForReview(record)}
            >
              提交审核
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const handleEdit = (record) => {
    console.log('=== handleEdit START ===');
    console.log('Editing room type:', record.id, record.name);
    console.log('Current fileList before clear:', fileList);
    
    setEditingRoom(record)
    form.setFieldsValue({
      name: record.name,
      areaSqm: record.areaSqm,
      bedType: record.bedType,
      maxGuests: record.maxGuests,
      breakfast: record.breakfast === 'yes',
    })
    
    setFileList([])
    setRoomPictures([])
    
    fetchRoomPictures(record.id)
    
    setIsDrawerOpen(true)
    console.log('=== handleEdit END ===');
  }

  const handleAdd = () => {
    if (!selectedHotel) {
      message.warning('请先选择一个酒店')
      return
    }
    form.resetFields()
    setEditingRoom(null)
    setFileList([])
    setRoomPictures([])
    setIsDrawerOpen(true)
  }

  const handleDrawerOk = async () => {
    console.log('=== handleDrawerOk START ===');
    console.log('editingRoom:', editingRoom);
    console.log('fileList:', fileList);
    console.log('fileList.length:', fileList.length);
    
    try {
      const values = await form.validateFields()
      console.log('Form values:', values);
      const token = getToken()

      let roomTypeId = editingRoom?.id

      // 统一更新房型信息，状态改为草稿
      if (editingRoom) {
        console.log('执行更新房型信息');
        const roomTypeData = {
          ...values,
          hotelId: selectedHotel?.id,
          status: 'DRAFT', // 改为草稿状态，需要重新审核
          breakfast: values.breakfast ? 'yes' : 'no',
        }

        const response = await fetch(`/api/room-type/${editingRoom.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(roomTypeData)
        })

        if (response.ok) {
          message.success('修改成功，已保存为草稿，请重新提交审核')
        } else {
          const errorData = await response.json().catch(() => ({}))
          message.error(errorData.message || '修改失败')
          return
        }
      } else {
        // 新增房型
        console.log('执行新增房型');
        const roomTypeData = {
          ...values,
          hotelId: selectedHotel?.id,
          status: 'DRAFT',
          breakfast: values.breakfast ? 'yes' : 'no',
        }

        const response = await fetch(`/api/room-type`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(roomTypeData)
        })

        if (response.ok) {
          const result = await response.json()
          roomTypeId = result.data?.id
          console.log('新增房型成功，roomTypeId:', roomTypeId);
          message.success('添加成功，已保存为草稿')
        } else {
          const errorData = await response.json().catch(() => ({}))
          message.error(errorData.message || '添加失败')
          return
        }
      }

      // 保存房型图片
      console.log('准备保存图片，roomTypeId:', roomTypeId, 'fileList.length:', fileList.length);
      if (roomTypeId) {
        if (fileList.length > 0) {
          console.log('开始保存图片，房型ID:', roomTypeId)
          await saveRoomPictures(roomTypeId)
        } else {
          console.log('fileList为空，删除该房型的所有图片，房型ID:', roomTypeId);
          await deleteAllRoomPictures(roomTypeId)
        }
      } else {
        console.log('跳过保存图片，roomTypeId:', roomTypeId, 'fileList.length:', fileList.length);
      }

      fetchRoomTypes(selectedHotel.id)
      setIsDrawerOpen(false)
      console.log('=== handleDrawerOk END ===');
    } catch (error) {
      console.error('Validation failed:', error)
      message.error('保存失败，请重试')
    }
  }

  const deleteAllRoomPictures = async (roomTypeId) => {
    console.log('=== deleteAllRoomPictures START ===');
    console.log('RoomType ID:', roomTypeId);
    
    try {
      const token = getToken();
      console.log('Token:', token ? 'Exists' : 'Not found');
      
      const response = await fetch(`/api/roomtype-picture/room-type/${roomTypeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        console.log('删除房型图片成功');
        message.success('已删除所有房型图片');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('删除房型图片失败:', errorData.message || '未知错误');
        message.error('删除房型图片失败: ' + (errorData.message || '未知错误'));
      }
    } catch (error) {
      console.error('删除房型图片失败:', error);
      message.error('删除房型图片时发生错误');
    } finally {
      console.log('=== deleteAllRoomPictures END ===');
    }
  }

  const saveRoomPictures = async (roomTypeId) => {
    console.log('=== saveRoomPictures START ===');
    console.log('RoomType ID:', roomTypeId);
    console.log('File list:', fileList);
    
    try {
      const token = getToken();
      console.log('Token:', token ? 'Exists' : 'Not found');
      
      // 确保selectedHotel存在
      if (!selectedHotel) {
        console.error('Selected hotel not found');
        message.error('保存图片失败: 未选择酒店');
        return;
      }
      
      const pictures = fileList
        .filter(file => file.status === 'done')
        .map((file, index) => {
          // 尝试从多个地方提取文件名
          let filename = null;
          if (file.response?.data?.filename) {
            filename = file.response.data.filename;
          } else if (file.response?.data?.url) {
            filename = file.response.data.url;
          } else if (file.response?.filename) {
            filename = file.response.filename;
          } else if (file.response?.url) {
            filename = file.response.url;
          } else if (file.url) {
            // 从url中提取文件名
            filename = file.url.split('/').pop();
          }
          
          console.log('提取的文件名:', filename, '文件信息:', file);
          
          return {
            hotelId: selectedHotel.id,
            roomTypeId: roomTypeId,
            url: filename,
            sortNo: index
          };
        })
        .filter(pic => pic.url) // 只保留有url的图片

      console.log('准备保存的图片数据:', pictures);
      console.log('Selected hotel:', selectedHotel);

      if (pictures.length === 0) {
        console.log('没有图片需要保存');
        return;
      }

      // 删除旧图片
      console.log('Deleting old pictures for room type:', roomTypeId);
      const deleteResponse = await fetch(`/api/roomtype-picture/room-type/${roomTypeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Delete old pictures response:', deleteResponse.status, deleteResponse.statusText);

      // 批量添加新图片
      console.log('Sending batch create request...');
      console.log('Request URL:', '/api/roomtype-picture/batch');
      console.log('Request headers:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      console.log('Request body:', JSON.stringify(pictures));
      
      const response = await fetch(`/api/roomtype-picture/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pictures)
      });

      console.log('Batch create response status:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('保存房型图片成功:', result);
        message.success('保存图片成功');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('保存房型图片失败:', errorData.message || '未知错误');
        message.error('保存图片失败: ' + (errorData.message || '未知错误'));
      }
    } catch (error) {
      console.error('保存房型图片失败:', error);
      message.error('保存图片时发生错误');
    } finally {
      console.log('=== saveRoomPictures END ===');
    }
  }

  const handleSubmitForReview = async (record) => {
    try {
      const token = getToken()
      const response = await fetch(`/api/room-type/${record.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        message.success('提交审核成功')
        fetchRoomTypes(selectedHotel.id)
      } else {
        const errorData = await response.json().catch(() => ({}))
        message.error(errorData.message || '提交审核失败')
      }
    } catch (error) {
      console.error('Submit for review failed:', error)
      message.error('网络错误，提交审核失败')
    }
  }

  const uploadProps = {
    name: 'file',
    action: '/api/upload/roompicture',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    data: {
      hotelId: selectedHotel?.id,
      roomTypeId: editingRoom?.id,
    },
    fileList,
    onChange: ({ fileList: newFileList }) => {
      console.log('=== File upload onChange START ===');
      console.log('New file list:', newFileList);
      console.log('Current hotelId:', selectedHotel?.id);
      console.log('Current roomTypeId:', editingRoom?.id);
      
      // 处理上传完成的文件，确保文件名被正确提取
      const processedFileList = newFileList.map(file => {
        console.log('Processing file:', file);
        
        if (file.status === 'done') {
          // 确保response存在
          if (file.response) {
            console.log('File response:', file.response);
            console.log('File response keys:', Object.keys(file.response));
            console.log('File response type:', typeof file.response);
            // 从响应中提取filename或url
            const filename = file.response.filename || file.response.url;
            console.log('Extracted filename:', filename);
            return {
              ...file,
              response: {
                ...file.response,
                filename: filename
              }
            };
          } else {
            // 如果response不存在，尝试从url中提取文件名
            console.warn('文件上传响应不存在:', file);
            return file;
          }
        } else if (file.status === 'error') {
          console.error('文件上传失败:', file.error);
        } else if (file.status === 'uploading') {
          console.log('文件上传中:', file.name);
        }
        return file;
      });
      
      console.log('处理后的文件列表:', processedFileList);
      setFileList(processedFileList);
      console.log('=== File upload onChange END ===');
    },
    onRemove: async (file) => {
      if (file.response?.filename) {
        try {
          await fetch(`/api/upload/roompicture/${file.response.filename}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${getToken()}`
            }
          })
        } catch (error) {
          console.error('删除图片失败:', error)
        }
      }
      return true
    },
    listType: 'picture-card',
    multiple: true,
    maxCount: 9,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('只能上传图片文件!')
        return false
      }
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB!')
        return false
      }
      return true
    },
    // 添加拖动排序功能
    onPreview: (file) => {
      console.log('预览图片:', file)
    },
    // 启用排序
    sortable: true,
  }

  return (
    <div>
      <Card
        title="房型管理"
        bordered={false}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增房型
          </Button>
        }
      >
        {apiError && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '4px', color: '#ff4d4f' }}>
            {apiError}
          </div>
        )}

        {hotelsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            加载中...
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              <Space style={{ width: '100%' }} size="large">
                <AutoComplete
                  style={{ width: 500 }}
                  placeholder="请搜索并选择酒店"
                  value={searchValue}
                  options={hotels
                    .filter(hotel =>
                      hotel.nameZh?.toLowerCase().includes(searchValue.toLowerCase()) ||
                      hotel.nameEn?.toLowerCase().includes(searchValue.toLowerCase())
                    )
                    .map(hotel => ({
                      value: hotel.id,
                      label: `${hotel.nameZh} ${hotel.nameEn ? `(${hotel.nameEn})` : ''}`,
                    }))
                  }
                  onSelect={handleSelectHotel}
                  onSearch={handleSearch}
                  filterOption={(inputValue, option) =>
                    option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                >
                  <Input
                    suffix={<SearchOutlined />}
                  />
                </AutoComplete>

                {selectedHotel && (
                  <Tag color="blue" closable onClose={() => setSelectedHotel(null)} style={{ fontSize: '16px', padding: '8px 16px' }}>
                    已选：{selectedHotel.nameZh}
                  </Tag>
                )}
              </Space>
            </div>

            {!selectedHotel ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                请先在上方搜索栏中选择一个酒店
              </div>
            ) : (
              <>
                {roomTypesError && (
                  <div style={{ marginBottom: '16px', padding: '12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px', color: '#faad14' }}>
                    {roomTypesError}
                  </div>
                )}
                <Table
                  dataSource={dataSource}
                  columns={columns}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                  }}
                  loading={loading}
                />
              </>
            )}
          </>
        )}

      </Card>

      <Drawer
        title={editingRoom ? '编辑房型' : '新增房型'}
        placement="right"
        width={700}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsDrawerOpen(false)}>取消</Button>
              <Button type="primary" onClick={handleDrawerOk}>
                确定
              </Button>
            </Space>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            areaSqm: '30',
            bedType: '1张1.8米大床',
            maxGuests: 2,
            breakfast: false,
          }}
        >
          <Form.Item
            label="房型名称"
            name="name"
            rules={[{ required: true, message: '请输入房型名称' }]}
          >
            <Input placeholder="请输入房型名称" />
          </Form.Item>

          <Form.Item
            label="面积"
            name="areaSqm"
            rules={[{ required: true, message: '请输入面积' }]}
          >
            <Input placeholder="请输入面积，如：30" />
          </Form.Item>

          <Form.Item
            label="床型"
            name="bedType"
            rules={[{ required: true, message: '请选择床型' }]}
          >
            <Select placeholder="请选择床型">
              <Select.Option value="1张2.0米特大床">1张2.0米特大床</Select.Option>
              <Select.Option value="1张2.2米特大床">1张2.2米特大床</Select.Option>
              <Select.Option value="1张1.8米大床">1张1.8米大床</Select.Option>
              <Select.Option value="2张1.51米大床">2张1.51米大床</Select.Option>
              <Select.Option value="2张1.2m单人床">2张1.2m单人床</Select.Option>
              <Select.Option value="1张1.51米大床">1张1.51米大床</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="可住人数"
            name="maxGuests"
            rules={[{ required: true, message: '请输入可住人数' }]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="是否含早" name="breakfast" valuePropName="checked">
            <Checkbox>含早餐</Checkbox>
          </Form.Item>

          <Form.Item label="房型图片">
            <Upload {...uploadProps}>
              {fileList.length >= 9 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
              支持上传最多9张图片，每张不超过5MB，支持jpg、png、gif格式
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}

export default RoomType
