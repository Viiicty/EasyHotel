import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import MainLayout from './components/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Overview from './pages/merchant/Overview'
import HotelInfo from './pages/merchant/HotelInfo'
import RoomType from './pages/merchant/RoomType'
import RoomPrice from './pages/merchant/RoomPrice'
import Submission from './pages/merchant/Submission'
import Orders from './pages/merchant/Orders'
import Marketing from './pages/merchant/Marketing'
import Account from './pages/merchant/Account'
import MessageCenter from './pages/merchant/MessageCenter'
import AuditCenter from './pages/admin/AuditCenter'
import HotelAudit from './pages/admin/HotelAudit'
import OnlineManage from './pages/admin/OnlineManage'
import BannerManage from './pages/admin/BannerManage'
import MerchantManage from './pages/admin/MerchantManage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ConfigProvider locale={zhCN}>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/merchant"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/merchant/overview" replace />} />
              <Route path="overview" element={<Overview />} />
              <Route path="hotel-info" element={<HotelInfo />} />
              <Route path="room-type" element={<RoomType />} />
              <Route path="room-price" element={<RoomPrice />} />
              <Route path="submission" element={<Submission />} />
              <Route path="orders" element={<Orders />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="account" element={<Account />} />
              <Route path="message" element={<MessageCenter />} />
            </Route>

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <MainLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="/admin/overview" replace />} />
              <Route path="overview" element={<AuditCenter />} />
              <Route path="hotel-audit" element={<HotelAudit />} />
              <Route path="online-manage" element={<OnlineManage />} />
              <Route path="banner-manage" element={<BannerManage />} />
              <Route path="merchant-manage" element={<MerchantManage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </AuthProvider>
  )
}

export default App
