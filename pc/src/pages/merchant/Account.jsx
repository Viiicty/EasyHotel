import { useState } from 'react'
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Drawer, Checkbox } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons'

function Account() {
  const [dataSource, setDataSource] = useState([
    {
      key: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      role: 'admin',
      status: '启用',
      lastLogin: '2024-01-15 14:30',
    },
    {
      key: '2',
      name: '李四',
      email: 'lisi@example.com',
      phone: '13800138001',
      role: 'merchant',
      status: '启用',
      lastLogin: '2024-01-14 10:20',
    },
    {
      key: '3',
      name: '王五',
      email: 'wangwu@example.com',
      phone: '13800138002',
      role: 'merchant',
      status: '禁用',
      lastLogin: '2024-01-13 16:45',
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [form] = Form.useForm()
  const [permissionForm] = Form.useForm()

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
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
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '商户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '启用' ? 'green' : 'default'}>
          {status}
        </Tag>
      ),
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handlePermission(record)}
          >
            权限
          </Button>
          <Button
            type="link"
            size="small"
            icon={record.status === '启用' ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === '启用' ? '禁用' : '启用'}
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
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingUser(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handlePermission = (record) => {
    setSelectedUser(record)
    permissionForm.setFieldsValue({
      permissions: ['hotel_info', 'room_type', 'room_price'],
    })
    setIsDrawerOpen(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户"${record.name}"吗？`,
      onOk: () => {
        const newData = dataSource.filter(item => item.key !== record.key)
        setDataSource(newData)
        message.success('删除成功')
      },
    })
  }

  const handleToggleStatus = (record) => {
    const newStatus = record.status === '启用' ? '禁用' : '启用'
    const newData = dataSource.map(item => {
      if (item.key === record.key) {
        return { ...item, status: newStatus }
      }
      return item
    })
    setDataSource(newData)
    message.success(`${newStatus}成功`)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingUser) {
        const newData = dataSource.map(item => {
          if (item.key === editingUser.key) {
            return { ...item, ...values }
          }
          return item
        })
        setDataSource(newData)
        message.success('修改成功')
      } else {
        const newUser = {
          ...values,
          key: Date.now().toString(),
          status: '启用',
          lastLogin: '-',
        }
        setDataSource([...dataSource, newUser])
        message.success('添加成功')
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleDrawerOk = async () => {
    try {
      await permissionForm.validateFields()
      message.success('权限设置成功')
      setIsDrawerOpen(false)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <div>
      <Card
        title="账号与权限"
        bordered={false}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增账号
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
        title={editingUser ? '编辑账号' : '新增账号'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            role: 'merchant',
            status: '启用',
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
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="merchant">商户</Select.Option>
            </Select>
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Drawer
        title={`权限设置 - ${selectedUser?.name}`}
        placement="right"
        width={500}
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
          form={permissionForm}
          layout="vertical"
        >
          <Form.Item label="功能权限" name="permissions">
            <Checkbox.Group style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Checkbox value="hotel_info">酒店信息管理</Checkbox>
                <Checkbox value="room_type">房型管理</Checkbox>
                <Checkbox value="room_price">房态房价</Checkbox>
                <Checkbox value="orders">订单管理</Checkbox>
                <Checkbox value="marketing">营销活动</Checkbox>
                <Checkbox value="submission">提交记录</Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item label="数据权限" name="dataPermissions">
            <Checkbox.Group style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Checkbox value="all">查看所有数据</Checkbox>
                <Checkbox value="own">仅查看自己创建的数据</Checkbox>
                <Checkbox value="export">导出数据</Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}

export default Account
