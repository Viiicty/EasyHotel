import { useState } from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import SideNav from './SideNav'

const { Header, Content, Sider } = Layout

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <TopBar />
      <Layout>
        <SideNav collapsed={collapsed} onCollapse={setCollapsed} />
        <Layout style={{ marginLeft: collapsed ? '80px' : '256px', transition: 'margin-left 0.2s', minHeight: 'calc(100vh - 64px)' }}>
          <Content style={{
            margin: '24px 24px 24px 24px',
            padding: '24px 24px 24px 24px',
            background: '#fff',
            minHeight: 'calc(100vh - 64px - 48px)'
          }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default MainLayout
