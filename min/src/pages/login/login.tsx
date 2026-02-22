import React, { Component } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { userService } from '../../services/user.service'
import './login.scss'

interface LoginState {
  phone: string
  code: string
  countdown: number
  sending: boolean
}

export default class LoginPage extends Component<{}, LoginState> {
  state: LoginState = {
    phone: '',
    code: '',
    countdown: 0,
    sending: false
  }

  componentDidMount() {
    console.log('=== LoginPage componentDidMount ===')
  }

  componentDidShow() {
    console.log('=== LoginPage componentDidShow ===')
  }

  handlePhoneChange = (e) => {
    this.setState({ phone: e.detail.value })
  }

  handleCodeChange = (e) => {
    this.setState({ code: e.detail.value })
  }

  handleSendCode = () => {
    const { phone, countdown } = this.state

    console.log('handleSendCode 被调用', { phone, countdown })

    if (!phone) {
      console.log('手机号为空')
      Taro.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      console.log('手机号格式不正确', phone)
      Taro.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    if (countdown > 0) {
      console.log('倒计时中，不能重复发送')
      return
    }

    console.log('开始发送验证码')
    this.setState({ sending: true })

    setTimeout(() => {
      console.log('发送验证码成功')
      this.setState({ countdown: 60, sending: false })
      this.startCountdown()
      Taro.showToast({
        title: '验证码已发送：123456',
        icon: 'success',
        duration: 3000
      })
    }, 1000)
  }

  startCountdown = () => {
    const timer = setInterval(() => {
      const { countdown } = this.state
      if (countdown <= 0) {
        clearInterval(timer)
        return
      }
      this.setState({ countdown: countdown - 1 })
    }, 1000)
  }

  handleLogin = async () => {
    const { phone, code } = this.state

    if (!phone) {
      Taro.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }

    if (!code) {
      Taro.showToast({
        title: '请输入验证码',
        icon: 'none'
      })
      return
    }

    if (code !== '123456') {
      Taro.showToast({
        title: '验证码错误',
        icon: 'none'
      })
      return
    }

    try {
      Taro.showLoading({ title: '登录中...' })

      console.log('=== 开始登录请求 ===')
      console.log('请求URL:', 'http://localhost:8888/auth/mini/login')
      console.log('请求数据:', { phone })

      const res = await Taro.request({
        url: 'http://localhost:8888/auth/mini/login',
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          phone: phone
        }
      })

      Taro.hideLoading()

      console.log('=== 登录响应 ===')
      console.log('响应状态码:', res.statusCode)
      console.log('响应数据:', res.data)
      console.log('响应数据.data:', res.data?.data)
      console.log('响应数据.data 是否存在:', !!res.data?.data)

      if ((res.statusCode === 200 || res.statusCode === 201) && res.data && res.data.data) {
        const user = res.data.data

        console.log('=== 登录成功 ===')
        console.log('用户信息:', user)
        console.log('用户ID:', user.id)
        console.log('用户Token:', user.access_token)
        console.log('用户name:', user.name)
        console.log('用户phone:', user.phone)
        console.log('用户idCard:', user.idCard)
        console.log('所有字段:', Object.keys(user))

        userService.setUserInfo({
          id: user.id,
          token: user.access_token,
          name: user.name,
          phone: user.phone,
          idCard: user.idCard
        })

        console.log('保存后的用户信息:', userService.getUserInfo())

        Taro.showToast({
          title: '登录成功',
          icon: 'success'
        })

        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        console.log('=== 用户不存在，跳转注册 ===')
        console.log('原因: res.statusCode=', res.statusCode, ', res.data=', res.data, ', res.data.data=', res.data?.data)
        Taro.showModal({
          title: '账号不存在',
          content: '该手机号尚未注册，是否前往注册？',
          confirmText: '去注册',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({
                url: '/pages/register/register?phone=' + encodeURIComponent(phone)
              })
            }
          }
        })
      }
    } catch (error) {
      Taro.hideLoading()
      console.error('=== 登录失败 ===')
      console.error('错误信息:', error)
      Taro.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      })
    }
  }

  handleDebug = () => {
    const userId = userService.getUserId()
    const token = userService.getToken()
    const isLoggedIn = userService.isLoggedIn()

    console.log('=== 登录状态 ===')
    console.log('userId:', userId)
    console.log('token:', token)
    console.log('isLoggedIn:', isLoggedIn)

    Taro.showModal({
      title: '登录状态',
      content: `userId: ${userId || '未设置'}\ntoken: ${token ? '已设置' : '未设置'}\n登录状态: ${isLoggedIn ? '已登录' : '未登录'}`,
      showCancel: false
    })
  }

  render() {
    console.log('=== LoginPage render ===')
    const { phone, code, countdown, sending } = this.state

    return (
      <View className='login-page'>
        <View className='login-container'>
          <View className='login-header'>
            <Text className='login-title'>欢迎登录</Text>
            <Text className='login-subtitle'>EasyHotel</Text>
          </View>

          <View className='login-form'>
            <View className='form-item'>
              <Input
                className='form-input'
                type='number'
                placeholder='请输入手机号'
                value={phone}
                onInput={this.handlePhoneChange}
                maxlength={11}
              />
            </View>

            <View className='form-item'>
              <Input
                className='form-input code-input'
                type='number'
                placeholder='请输入验证码'
                value={code}
                onInput={this.handleCodeChange}
                maxlength={6}
              />
              <Button
                className={`code-btn ${countdown > 0 ? 'disabled' : ''}`}
                onClick={this.handleSendCode}
                disabled={countdown > 0 || sending}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            </View>

            <Button className='login-btn' onClick={this.handleLogin}>登录</Button>
          </View>

          <View className='debug-section'>
            <Button className='debug-btn' onClick={this.handleDebug}>查看登录状态</Button>
          </View>

          <View className='login-footer'>
            <Text className='footer-text'>登录即表示同意</Text>
            <Text className='footer-link'>《用户协议》</Text>
            <Text className='footer-text'>和</Text>
            <Text className='footer-link'>《隐私政策》</Text>
          </View>
        </View>
      </View>
    )
  }
}
