import { useState } from 'react'
import { Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  MessageOutlined,
  SettingOutlined,
  FileTextOutlined,
  AuditOutlined,
  CloudUploadOutlined,
  ShopOutlined,
  UserSwitchOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

function SideNav({ collapsed, onCollapse }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const merchantMenuItems = [
    {
      key: '/merchant/overview',
      icon: <HomeOutlined />,
      label: '工作台',
    },
    {
      key: 'hotel',
      icon: <ApartmentOutlined />,
      label: '酒店管理',
      children: [
        {
          key: '/merchant/hotel-info',
          label: '录入新酒店',
        },
        {
          key: '/merchant/hotel-manage',
          label: '酒店管理',
        },
        {
          key: '/merchant/room-type',
          label: '房型管理',
        },
        {
          key: '/merchant/room-price',
          label: '房态房价',
        },
        {
          key: '/merchant/submission',
          label: '提交记录',
        },
        {
          key: '/merchant/orders',
          label: '订单管理',
        },
        {
          key: '/merchant/marketing',
          label: '营销活动',
        },
        {
          key: '/merchant/account',
          label: '账号与权限',
        },
        {
          key: '/merchant/message',
          label: '消息中心',
        },
      ],
    },
  ]

  const adminMenuItems = [
    {
      key: '/admin/overview',
      icon: <AuditOutlined />,
      label: '审核中心',
    },
    {
      key: '/admin/hotel-audit',
      icon: <ApartmentOutlined />,
      label: '酒店信息审核',
    },
    {
      key: '/admin/online-manage',
      icon: <CloudUploadOutlined />,
      label: '上线管理',
    },
    {
      key: '/admin/banner-manage',
      icon: <FileTextOutlined />,
      label: '首页 Banner 管理',
    },
    {
      key: '/admin/merchant-manage',
      icon: <ShopOutlined />,
      label: '商户管理',
    },
    {
      key: '/admin/operation-log',
      icon: <SettingOutlined />,
      label: '操作日志',
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key !== 'hotel') {
      navigate(key)
    }
  }

  const getSelectedKeys = () => {
    const pathname = location.pathname
    if (pathname.startsWith('/merchant/hotel')) {
      return [pathname]
    }
    return [pathname]
  }

  const getDefaultOpenKeys = () => {
    if (isAdmin) {
      return []
    }
    return ['hotel']
  }

  return (
    <div style={{
      height: 'calc(100vh - 64px)',
      background: '#fff',
      borderRight: '1px solid #f0f0f0',
      overflowY: 'auto',
      position: 'fixed',
      left: 0,
      top: '64px',
      width: collapsed ? '80px' : '256px',
      transition: 'width 0.2s',
      zIndex: 900
    }}>
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getDefaultOpenKeys()}
        style={{ height: '100%', borderRight: 'none' }}
        items={isAdmin ? adminMenuItems : merchantMenuItems}
        onClick={handleMenuClick}
      />
    </div>
  )
}

export default SideNav
