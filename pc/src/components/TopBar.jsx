import { BellOutlined, UserOutlined, DownOutlined } from '@ant-design/icons'
import { Dropdown, Badge, Avatar, Space } from 'antd'
import { useAuth } from '../contexts/AuthContext'

function TopBar() {
  const { user, logout } = useAuth()

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人中心',
    },
    {
      key: 'settings',
      label: '账号设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      onClick: logout,
    },
  ]

  return (
    <div style={{
      height: '64px',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#1890ff',
          cursor: 'pointer'
        }}>
          EasyHotel
        </div>
        <div style={{
          padding: '4px 12px',
          background: '#f0f2f5',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#666'
        }}>
          易宿酒店管理平台
        </div>
      </div>

      <Space size="large">
        <Badge count={5} offset={[-5, 5]}>
          <BellOutlined style={{ fontSize: '20px', color: '#666' }} />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{user?.name || '管理员'}</span>
            <DownOutlined style={{ fontSize: '12px', marginLeft: '8px' }} />
          </Space>
        </Dropdown>
      </Space>
    </div>
  )
}

export default TopBar
