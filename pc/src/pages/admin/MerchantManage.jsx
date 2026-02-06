import { useState } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Descriptions, Drawer, Switch } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  SearchOutlined
} from '@ant-design/icons'

function MerchantManage() {
  const [dataSource, setDataSource] = useState([
    {
      key: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      company: '杭州君悦酒店',
      city: '杭州',
      hotelCount: 3,
      status: 'active',
      registerTime: '2024-01-10',
      lastLogin: '2024-01-15 14:30',
    },
    {
      key: '2',
      name: '李四',
      email: 'lisi@example.com',
      phone: '13800138001',
      company: '北京瑞吉酒店',
      city: '北京',
      hotelCount: 2,
      status: 'active',
      registerTime: '2024-01-08',
      lastLogin: '2024-01-14 10:20',
    },
    {
      key: '3',
      name: '王五',
      email: 'wangwu@example.com',
      phone: '13800138002',
      company: '上海浦东香格里拉',
      city: '上海',
      hotelCount: 1,
      status: 'inactive',
      registerTime: '2024-01-05',
      lastLogin: '2024-01-13 16:45',
    },
    {
      key: '4',
      name: '赵六',
      email: 'zhaoliu@example.com',
      phone: '13800138003',
      company: '广州白云宾馆',
      city: '广州',
      hotelCount: 2,
      status: 'active',
      registerTime: '2024-01-03',
      lastLogin: '2024-01-12 09:15',
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [editingMerchant, setEditingMerchant] = useState(null)
  const [selectedMerchant, setSelectedMerchant] = useState(null)
  const [form] = Form.useForm()
  const [filters, setFilters] = useState({
    status: '',
    city: '',
    keyword: '',
  })

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: '公司/酒店',
      dataIndex: 'company',
      key: 'company',
      width: 180,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 100,
    },
    {
      title: '酒店数量',
      dataIndex: 'hotelCount',
      key: 'hotelCount',
      width: 100,
      render: (count) => <Tag color="blue">{count} 家</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'registerTime',
      key: 'registerTime',
      width: 120,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
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
            icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 'active' ? '禁用' : '启用'}
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
    setEditingMerchant(null)
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingMerchant(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleViewDetail = (record) => {
    setSelectedMerchant(record)
    setIsDetailDrawerOpen(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除商户"${record.name}"吗？`,
      onOk: () => {
        const newData = dataSource.filter(item => item.key !== record.key)
        setDataSource(newData)
        message.success('删除成功')
      },
    })
  }

  const handleToggleStatus = (record) => {
    const newStatus = record.status === 'active' ? 'inactive' : 'active'
    const newData = dataSource.map(item => {
      if (item.key === record.key) {
        return { ...item, status: newStatus }
      }
      return item
    })
    setDataSource(newData)
    message.success(`${newStatus === 'active' ? '启用' : '禁用'}成功`)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingMerchant) {
        const newData = dataSource.map(item => {
          if (item.key === editingMerchant.key) {
            return { ...item, ...values }
          }
          return item
        })
        setDataSource(newData)
        message.success('修改成功')
      } else {
        const newMerchant = {
          ...values,
          key: Date.now().toString(),
          hotelCount: 0,
          status: 'active',
          registerTime: new Date().toISOString().split('T')[0],
          lastLogin: '-',
        }
        setDataSource([...dataSource, newMerchant])
        message.success('添加成功')
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const filteredDataSource = dataSource.filter(item => {
    if (filters.status && item.status !== filters.status) return false
    if (filters.city && item.city !== filters.city) return false
    if (filters.keyword && !item.name.includes(filters.keyword) && !item.email.includes(filters.keyword) && !item.company.includes(filters.keyword)) return false
    return true
  })

  return (
    <div>
      <Card
        title="商户管理"
        bordered={false}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增商户
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space wrap>
            <Input
              placeholder="搜索姓名/邮箱/公司"
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
            <Select
              placeholder="状态"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
            <Select
              placeholder="城市"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, city: value })}
            >
              <Select.Option value="北京">北京</Select.Option>
              <Select.Option value="上海">上海</Select.Option>
              <Select.Option value="杭州">杭州</Select.Option>
              <Select.Option value="广州">广州</Select.Option>
            </Select>
          </Space>

          <Table
            dataSource={filteredDataSource}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{ x: 1600 }}
          />
        </Space>
      </Card>

      <Modal
        title={editingMerchant ? '编辑商户' : '新增商户'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
          }}
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            label="公司/酒店"
            name="company"
            rules={[{ required: true, message: '请输入公司/酒店' }]}
          >
            <Input placeholder="请输入公司/酒店" />
          </Form.Item>

          <Form.Item
            label="城市"
            name="city"
            rules={[{ required: true, message: '请选择城市' }]}
          >
            <Select placeholder="请选择城市">
              <Select.Option value="北京">北京</Select.Option>
              <Select.Option value="上海">上海</Select.Option>
              <Select.Option value="杭州">杭州</Select.Option>
              <Select.Option value="广州">广州</Select.Option>
            </Select>
          </Form.Item>

          {!editingMerchant && (
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item label="状态" name="status" valuePropName="checked">
            <Switch checkedChildren="正常" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="商户详情"
        placement="right"
        width={600}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
      >
        {selectedMerchant && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="姓名">
              {selectedMerchant.name}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">
              {selectedMerchant.email}
            </Descriptions.Item>
            <Descriptions.Item label="手机号">
              {selectedMerchant.phone}
            </Descriptions.Item>
            <Descriptions.Item label="公司/酒店">
              {selectedMerchant.company}
            </Descriptions.Item>
            <Descriptions.Item label="城市">
              {selectedMerchant.city}
            </Descriptions.Item>
            <Descriptions.Item label="酒店数量">
              <Tag color="blue">{selectedMerchant.hotelCount} 家</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedMerchant.status === 'active' ? 'green' : 'default'}>
                {selectedMerchant.status === 'active' ? '正常' : '禁用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="注册时间">
              {selectedMerchant.registerTime}
            </Descriptions.Item>
            <Descriptions.Item label="最后登录">
              {selectedMerchant.lastLogin}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default MerchantManage
