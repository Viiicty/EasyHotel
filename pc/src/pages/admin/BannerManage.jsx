import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, message, Image, InputNumber } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons'

const API_BASE = '/api'

function BannerManage() {
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)

  const getToken = () => {
    return localStorage.getItem('token')
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
          src={`${API_BASE}/upload/image/${coverImage}`}
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
    </div>
  )
}

export default BannerManage
