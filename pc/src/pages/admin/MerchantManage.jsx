import { useState, useEffect } from 'react'
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
import { adminMerchantManageApi } from '../../api/adminMerchantManage'

function MerchantManage() {
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    loadMerchants()
  }, [filters])

  const loadMerchants = async () => {
    setLoading(true)
    try {
      const data = await adminMerchantManageApi.getMerchants(filters)
      const formattedData = data.map(item => ({
        ...item,
        key: item.id,
        hotelCount: 0,
        registerTime: item.createdTime ? new Date(item.createdTime).toISOString().split('T')[0] : '-',
        lastLogin: '-',
      }))
      setDataSource(formattedData)
    } catch (error) {
      console.error('Failed to load merchants:', error)
      message.error('加载商户列表失败')
    } finally {
      setLoading(false)
    }
  }

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
      width: 220,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'YES' ? 'green' : 'default'}>
          {status === 'YES' ? '正常' : '禁用'}
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
      title: '操作',
      key: 'action',
      width: 280,
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
            icon={record.status === 'YES' ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 'YES' ? '禁用' : '启用'}
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
      content: `确定要删除商户"${record.name}"吗？删除后该商户的所有数据将被清除，无法恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await adminMerchantManageApi.deleteMerchant(record.id)
          message.success('删除成功')
          loadMerchants()
        } catch (error) {
          console.error('Delete failed:', error)
          message.error('删除失败')
        }
      },
    })
  }

  const handleToggleStatus = async (record) => {
    const newStatus = record.status === 'YES' ? 'NO' : 'YES'
    Modal.confirm({
      title: newStatus === 'YES' ? '确认启用' : '确认禁用',
      content: `确定要${newStatus === 'YES' ? '启用' : '禁用'}商户"${record.name}"吗？`,
      onOk: async () => {
        try {
          await adminMerchantManageApi.updateMerchantStatus(record.id, newStatus)
          message.success(`${newStatus === 'YES' ? '启用' : '禁用'}成功`)
          loadMerchants()
        } catch (error) {
          console.error('Update status failed:', error)
          message.error(`${newStatus === 'YES' ? '启用' : '禁用'}失败`)
        }
      },
    })
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        status: values.status ? 'YES' : 'NO'
      }
      if (editingMerchant) {
        await adminMerchantManageApi.updateMerchant(editingMerchant.id, submitData)
        message.success('修改成功')
        loadMerchants()
      } else {
        await adminMerchantManageApi.createMerchant(submitData)
        message.success('添加成功')
        loadMerchants()
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Operation failed:', error)
      message.error(editingMerchant ? '修改失败' : '添加失败')
    }
  }

  const filteredDataSource = dataSource.filter(item => {
    if (filters.status && item.status !== filters.status) return false
    if (filters.keyword && !item.name.includes(filters.keyword) && !item.email.includes(filters.keyword)) return false
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
              placeholder="搜索姓名/邮箱"
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
              <Select.Option value="YES">正常</Select.Option>
              <Select.Option value="NO">禁用</Select.Option>
            </Select>
          </Space>

          <Table
            dataSource={filteredDataSource}
            columns={columns}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{ x: 1000 }}
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
            status: 'YES',
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
            <Descriptions.Item label="状态">
              <Tag color={selectedMerchant.status === 'YES' ? 'green' : 'default'}>
                {selectedMerchant.status === 'YES' ? '正常' : '禁用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="注册时间">
              {selectedMerchant.registerTime}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default MerchantManage
