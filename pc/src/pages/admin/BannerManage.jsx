import { useState } from 'react'
import { Card, Table, Button, Space, Modal, Form, Input, DatePicker, InputNumber, Select, Tag, message, Upload, Image } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined
} from '@ant-design/icons'

function BannerManage() {
  const [dataSource, setDataSource] = useState([
    {
      key: '1',
      title: '春节特惠活动',
      image: 'https://via.placeholder.com/800x400',
      hotelId: '1',
      hotelName: '杭州君悦酒店',
      city: '杭州',
      startDate: '2024-02-01',
      endDate: '2024-02-10',
      status: 'active',
      sort: 1,
      createTime: '2024-01-15',
    },
    {
      key: '2',
      title: '周末套餐推广',
      image: 'https://via.placeholder.com/800x400',
      hotelId: '2',
      hotelName: '北京瑞吉酒店',
      city: '北京',
      startDate: '2024-01-20',
      endDate: '2024-12-31',
      status: 'active',
      sort: 2,
      createTime: '2024-01-14',
    },
    {
      key: '3',
      title: '早鸟优惠',
      image: 'https://via.placeholder.com/800x400',
      hotelId: '3',
      hotelName: '上海浦东香格里拉',
      city: '上海',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      status: 'inactive',
      sort: 3,
      createTime: '2024-01-01',
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [form] = Form.useForm()

  const columns = [
    {
      title: 'Banner 标题',
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 120,
      render: (image) => (
        <Image
          width={80}
          height={45}
          src={image}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
        />
      ),
    },
    {
      title: '关联酒店',
      dataIndex: 'hotelName',
      key: 'hotelName',
      width: 150,
    },
    {
      title: '投放城市',
      dataIndex: 'city',
      key: 'city',
      width: 100,
    },
    {
      title: '投放时间',
      key: 'dateRange',
      width: 200,
      render: (_, record) => `${record.startDate} 至 ${record.endDate}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '投放中' : '已结束'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const handleAdd = () => {
    form.resetFields()
    setEditingBanner(null)
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingBanner(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handlePreview = (record) => {
    setPreviewImage(record.image)
    setIsPreviewModalOpen(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 Banner"${record.title}"吗？`,
      onOk: () => {
        const newData = dataSource.filter(item => item.key !== record.key)
        setDataSource(newData)
        message.success('删除成功')
      },
    })
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingBanner) {
        const newData = dataSource.map(item => {
          if (item.key === editingBanner.key) {
            return { ...item, ...values }
          }
          return item
        })
        setDataSource(newData)
        message.success('修改成功')
      } else {
        const newBanner = {
          ...values,
          key: Date.now().toString(),
          status: 'active',
          createTime: new Date().toISOString().split('T')[0],
        }
        setDataSource([...dataSource, newBanner])
        message.success('创建成功')
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const uploadProps = {
    name: 'file',
    action: '/api/upload',
    listType: 'picture-card',
    maxCount: 1,
    onChange(info) {
      if (info.file.status === 'done') {
        form.setFieldsValue({ image: info.file.response.url })
      }
    },
  }

  return (
    <div>
      <Card
        title="首页 Banner 管理"
        bordered={false}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增 Banner
          </Button>
        }
      >
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={editingBanner ? '编辑 Banner' : '新增 Banner'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            sort: 1,
          }}
        >
          <Form.Item
            label="Banner 标题"
            name="title"
            rules={[{ required: true, message: '请输入 Banner 标题' }]}
          >
            <Input placeholder="请输入 Banner 标题" />
          </Form.Item>

          <Form.Item
            label="Banner 图片"
            name="image"
            rules={[{ required: true, message: '请上传 Banner 图片' }]}
          >
            <Upload {...uploadProps}>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: '8px' }}>上传图片</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            label="关联酒店"
            name="hotelId"
            rules={[{ required: true, message: '请选择关联酒店' }]}
          >
            <Select placeholder="请选择关联酒店">
              <Select.Option value="1">杭州君悦酒店</Select.Option>
              <Select.Option value="2">北京瑞吉酒店</Select.Option>
              <Select.Option value="3">上海浦东香格里拉</Select.Option>
              <Select.Option value="4">广州白云宾馆</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="投放城市"
            name="city"
            rules={[{ required: true, message: '请选择投放城市' }]}
          >
            <Select placeholder="请选择投放城市">
              <Select.Option value="北京">北京</Select.Option>
              <Select.Option value="上海">上海</Select.Option>
              <Select.Option value="杭州">杭州</Select.Option>
              <Select.Option value="广州">广州</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="投放时间"
            name="dateRange"
            rules={[{ required: true, message: '请选择投放时间' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="排序"
            name="sort"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="状态" name="status">
            <Select>
              <Select.Option value="active">投放中</Select.Option>
              <Select.Option value="inactive">已结束</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Banner 预览"
        open={isPreviewModalOpen}
        onCancel={() => setIsPreviewModalOpen(false)}
        width={800}
        footer={
          <Button onClick={() => setIsPreviewModalOpen(false)}>关闭</Button>
        }
      >
        <div style={{ textAlign: 'center' }}>
          <Image
            src={previewImage}
            alt="Banner 预览"
            style={{ width: '100%', maxWidth: '750px', borderRadius: '8px' }}
          />
        </div>
      </Modal>
    </div>
  )
}

export default BannerManage
