import { useState } from 'react'
import { Card, Table, Button, Space, Modal, Form, Input, DatePicker, InputNumber, Select, Tag, message, Switch } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StopOutlined
} from '@ant-design/icons'

function Marketing() {
  const [dataSource, setDataSource] = useState([
    {
      key: '1',
      name: '春节特惠',
      type: '折扣',
      discount: 20,
      startDate: '2024-02-01',
      endDate: '2024-02-10',
      status: '进行中',
      createTime: '2024-01-15',
    },
    {
      key: '2',
      name: '周末套餐',
      type: '套餐',
      discount: 0,
      startDate: '2024-01-20',
      endDate: '2024-12-31',
      status: '进行中',
      createTime: '2024-01-14',
    },
    {
      key: '3',
      name: '早鸟优惠',
      type: '折扣',
      discount: 15,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      status: '已结束',
      createTime: '2024-01-01',
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [form] = Form.useForm()

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '活动类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === '折扣' ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '折扣/优惠',
      dataIndex: 'discount',
      key: 'discount',
      width: 120,
      render: (discount, record) => {
        if (record.type === '折扣') {
          return `${discount}%`
        }
        return '-'
      },
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '进行中' ? 'green' : 'default'}>
          {status}
        </Tag>
      ),
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
            onClick={() => handleViewDetail(record)}
          >
            查看
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
            icon={<StopOutlined />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === '进行中' ? '停用' : '启用'}
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
    setEditingActivity(null)
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingActivity(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleViewDetail = (record) => {
    setSelectedActivity(record)
    setIsDetailModalOpen(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除活动"${record.name}"吗？`,
      onOk: () => {
        const newData = dataSource.filter(item => item.key !== record.key)
        setDataSource(newData)
        message.success('删除成功')
      },
    })
  }

  const handleToggleStatus = (record) => {
    const newStatus = record.status === '进行中' ? '已结束' : '进行中'
    const newData = dataSource.map(item => {
      if (item.key === record.key) {
        return { ...item, status: newStatus }
      }
      return item
    })
    setDataSource(newData)
    message.success(`${newStatus === '进行中' ? '启用' : '停用'}成功`)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingActivity) {
        const newData = dataSource.map(item => {
          if (item.key === editingActivity.key) {
            return { ...item, ...values }
          }
          return item
        })
        setDataSource(newData)
        message.success('修改成功')
      } else {
        const newActivity = {
          ...values,
          key: Date.now().toString(),
          status: '进行中',
          createTime: new Date().toISOString().split('T')[0],
        }
        setDataSource([...dataSource, newActivity])
        message.success('创建成功')
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <div>
      <Card
        title="营销活动"
        bordered={false}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建活动
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
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingActivity ? '编辑活动' : '新建活动'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: '折扣',
            discount: 0,
          }}
        >
          <Form.Item
            label="活动名称"
            name="name"
            rules={[{ required: true, message: '请输入活动名称' }]}
          >
            <Input placeholder="请输入活动名称" />
          </Form.Item>

          <Form.Item
            label="活动类型"
            name="type"
            rules={[{ required: true, message: '请选择活动类型' }]}
          >
            <Select placeholder="请选择活动类型">
              <Select.Option value="折扣">折扣</Select.Option>
              <Select.Option value="套餐">套餐</Select.Option>
              <Select.Option value="优惠券">优惠券</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('type')
              return type === '折扣' ? (
                <Form.Item
                  label="折扣比例"
                  name="discount"
                  rules={[{ required: true, message: '请输入折扣比例' }]}
                >
                  <InputNumber min={1} max={100} style={{ width: '100%' }} addonAfter="%" />
                </Form.Item>
              ) : null
            }}
          </Form.Item>

          <Form.Item
            label="活动时间"
            name="dateRange"
            rules={[{ required: true, message: '请选择活动时间' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="活动描述" name="description">
            <Input.TextArea rows={4} placeholder="请输入活动描述" />
          </Form.Item>

          <Form.Item label="是否启用" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="活动详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={600}
        footer={
          <Button onClick={() => setIsDetailModalOpen(false)}>关闭</Button>
        }
      >
        {selectedActivity && (
          <div>
            <p><strong>活动名称：</strong>{selectedActivity.name}</p>
            <p><strong>活动类型：</strong>
              <Tag color={selectedActivity.type === '折扣' ? 'blue' : 'green'}>
                {selectedActivity.type}
              </Tag>
            </p>
            {selectedActivity.type === '折扣' && (
              <p><strong>折扣比例：</strong>{selectedActivity.discount}%</p>
            )}
            <p><strong>活动时间：</strong>{selectedActivity.startDate} 至 {selectedActivity.endDate}</p>
            <p><strong>状态：</strong>
              <Tag color={selectedActivity.status === '进行中' ? 'green' : 'default'}>
                {selectedActivity.status}
              </Tag>
            </p>
            <p><strong>创建时间：</strong>{selectedActivity.createTime}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Marketing
