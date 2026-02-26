import { useState } from 'react'
import { Form, Input, Button, message, Checkbox, Typography, Divider } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const { Text, Link: AntLink, Title } = Typography

function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const result = await response.json()
      console.log(result)
      if (response.ok && result.code === 200) {
        login(result.data.user, result.data.access_token)
        message.success('登录成功')
        const redirectPath = result.data.user.role === 'admin' ? '/admin/overview' : '/merchant/overview'
        navigate(redirectPath)
      } else {
        message.error(result.message || '登录失败')
      }
    } catch (error) {
      message.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        height: '75vh',
        background: '#667eea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        paddingTop: '40px',
        paddingBottom: '40px'
      }}>
        <div style={{
          width: '500px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          padding: '40px',
          zIndex: 10
        }}>
          <Title level={4} style={{ marginBottom: '24px', fontSize: '18px' }}>登录</Title>
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="default"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="邮箱"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link to="/forgot-password">
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    忘记密码？
                  </Text>
                </Link>
              </div>
            </Form.Item>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('请同意隐私政策')),
                },
              ]}
            >
              <Checkbox>
                登录或注册代表您同意我们的
                <AntLink href="#" target="_blank" style={{ fontSize: '14px', marginLeft: '4px' }}>
                  隐私政策
                </AntLink>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 40 }}
              >
                登录
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text type="secondary">
                还没有账号？
                <Link to="/register" style={{ fontSize: '14px' }}>
                  立即注册
                </Link>
              </Text>
            </div>
          </Form>
        </div>

        <div style={{
          position: 'absolute',
          right: '15%',
          top: '50%',
          transform: 'translateY(-50%)',
          textAlign: 'center',
          color: 'white',
          zIndex: 5
        }}>
          <Title level={2} style={{ color: 'white', marginBottom: '20px', fontSize: '28px' }}>
            登录并管理您的房源
          </Title>
          <Text style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)' }}>
            加入我们，开启您的酒店管理之旅
          </Text>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        padding: '40px'
      }}>
        <Title level={2} style={{ marginBottom: '16px' }}>
          欢迎使用 EasyHotel
        </Title>
        <Text type="secondary" style={{ fontSize: '16px', marginBottom: '40px' }}>
          不太专业的酒店管理系统，为您提供并不便捷的服务
        </Text>

        <Divider style={{ width: '300px', marginBottom: '40px' }} />

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Title level={4} style={{ marginBottom: '8px' }}>
            EasyHotel
          </Title>
          <Text type="secondary">不太专业的酒店管理系统</Text>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Text type="secondary">
            地址：上海市徐汇区太原路不知道多少弄9号
          </Text>
          <br />
          <Text type="secondary">
            电话：400-888-8888
          </Text>
          <br />
          <Text type="secondary">
            邮箱：contact@easyhotel.com
          </Text>
        </div>

        <div style={{ marginTop: '20px' }}>
          <Text type="secondary">
            友情链接：
            <AntLink href="https://www.ctrip.com/" target="_blank" style={{ marginLeft: '8px' }}>
              携程旅行网
            </AntLink>
          </Text>
        </div>
      </div>
    </div>
  )
}

export default Login
