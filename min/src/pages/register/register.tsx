import React, { Component } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { userService } from '../../services/user.service'
import './register.scss'

interface RegisterState {
  phone: string
  email: string
  realName: string
  code: string
  password: string
  confirmPassword: string
  countdown: number
  sending: boolean
}

export default class RegisterPage extends Component<{}, RegisterState> {
  state: RegisterState = {
    phone: '',
    email: '',
    realName: '',
    code: '',
    password: '',
    confirmPassword: '',
    countdown: 0,
    sending: false
  }

  componentDidShow() {
    const instance = getCurrentInstance()
    const { phone } = instance.router?.params || {}
    if (phone) {
      this.setState({ phone })
    }
  }

  handlePhoneChange = (e) => {
    this.setState({ phone: e.detail.value })
  }

  handleEmailChange = (e) => {
    this.setState({ email: e.detail.value })
  }

  handleRealNameChange = (e) => {
    this.setState({ realName: e.detail.value })
  }

  handleCodeChange = (e) => {
    this.setState({ code: e.detail.value })
  }

  handlePasswordChange = (e) => {
    this.setState({ password: e.detail.value })
  }

  handleConfirmPasswordChange = (e) => {
    this.setState({ confirmPassword: e.detail.value })
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

  handleRegister = async () => {
    const { phone, email, realName, code, password, confirmPassword } = this.state

    if (!phone) {
      Taro.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Taro.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    if (!email) {
      Taro.showToast({
        title: '请输入邮箱',
        icon: 'none'
      })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Taro.showToast({
        title: '请输入正确的邮箱',
        icon: 'none'
      })
      return
    }

    if (!realName) {
      Taro.showToast({
        title: '请输入真实姓名',
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

    if (!password) {
      Taro.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    if (password.length < 6) {
      Taro.showToast({
        title: '密码至少6位',
        icon: 'none'
      })
      return
    }

    if (password !== confirmPassword) {
      Taro.showToast({
        title: '两次密码不一致',
        icon: 'none'
      })
      return
    }

    try {
      Taro.showLoading({ title: '注册中...' })

      const res = await Taro.request({
        url: 'http://192.168.3.22:8888/auth/mini/register',
        method: 'POST',
        data: {
          phone: phone,
          email: email,
          name: realName,
          password: password
        },
        header: {
          'Content-Type': 'application/json'
        }
      })

      Taro.hideLoading()

      if (res.statusCode === 201 || res.statusCode === 200) {
        Taro.showToast({
          title: '注册成功',
          icon: 'success'
        })

        userService.setUserInfo({
          id: res.data.id,
          token: res.data.access_token
        })

        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        Taro.showToast({
          title: res.data.message || '注册失败',
          icon: 'none'
        })
      }
    } catch (error) {
      Taro.hideLoading()
      console.error('注册失败:', error)
      Taro.showToast({
        title: '注册失败，请重试',
        icon: 'none'
      })
    }
  }

  render() {
    const { phone, email, realName, code, password, confirmPassword, countdown, sending } = this.state

    return (
      <View className='register-page'>
        <View className='register-container'>
          <View className='register-header'>
            <Text className='register-title'>注册账号</Text>
            <Text className='register-subtitle'>EasyHotel</Text>
          </View>

          <View className='register-form'>
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

            <View className='form-item'>
              <Input
                className='form-input'
                type='text'
                placeholder='请输入邮箱'
                value={email}
                onInput={this.handleEmailChange}
                adjust-position
                cursor-spacing={20}
                confirm-type='next'
              />
            </View>

            <View className='form-item'>
              <Input
                className='form-input'
                type='text'
                placeholder='请输入真实姓名'
                value={realName}
                onInput={this.handleRealNameChange}
              />
            </View>

            <View className='form-item'>
              <Input
                className='form-input'
                password
                placeholder='请输入密码（至少6位）'
                value={password}
                onInput={this.handlePasswordChange}
                adjust-position
                cursor-spacing={20}
                confirm-type='next'
              />
            </View>

            <View className='form-item'>
              <Input
                className='form-input'
                password
                placeholder='请确认密码'
                value={confirmPassword}
                onInput={this.handleConfirmPasswordChange}
                adjust-position
                cursor-spacing={20}
                confirm-type='done'
              />
            </View>

            <Button className='register-btn' onClick={this.handleRegister}>注册</Button>
          </View>

          <View className='register-footer'>
            <Text className='footer-text'>已有账号？</Text>
            <Text className='footer-link' onClick={() => Taro.navigateTo({ url: '/pages/login/login' })}>去登录</Text>
          </View>
        </View>
      </View>
    )
  }
}
