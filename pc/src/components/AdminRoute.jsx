import { Navigate } from 'react-router-dom'
import { Result, Button } from 'antd'
import { useAuth } from '../contexts/AuthContext'

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>加载中...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return (
      <Result
        status="403"
        title="权限不足"
        subTitle="您需要管理员权限才能访问此页面"
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            返回上一页
          </Button>
        }
      />
    )
  }

  return children
}

export default AdminRoute
