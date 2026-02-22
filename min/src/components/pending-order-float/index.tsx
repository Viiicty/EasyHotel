import React, { useState, useEffect } from 'react'
import { View, Text, CoverView, CoverImage } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface PendingOrderFloatProps {
  visible: boolean
  order: any
}

export default function PendingOrderFloat({ visible, order }: PendingOrderFloatProps) {
  const [remainingTime, setRemainingTime] = useState(order?.remainingTime || 0)

  console.log('=== PendingOrderFloat render ===')
  console.log('visible:', visible)
  console.log('order:', order)
  console.log('remainingTime:', remainingTime)

  useEffect(() => {
    if (!visible || !order) return

    console.log('=== PendingOrderFloat useEffect ===')
    console.log('order.remainingTime:', order.remainingTime)
    setRemainingTime(order.remainingTime || 0)

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [visible, order])

  if (!visible || !order || remainingTime <= 0) {
    console.log('=== PendingOrderFloat 不显示 ===')
    console.log('!visible:', !visible)
    console.log('!order:', !order)
    console.log('remainingTime <= 0:', remainingTime <= 0)
    return null
  }

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/order/detail?orderId=${order.orderId}`
    })
  }

  console.log('=== PendingOrderFloat 显示浮窗 ===')
  console.log('当前剩余时间:', remainingTime)
  console.log('格式化时间:', formatCountdown(remainingTime))
  console.log('订单ID:', order.orderId)
  
  return (
    <CoverView className='pending-order-float' onClick={handleClick}>
      <CoverView className='float-content'>
        <CoverView className='float-text'>待支付订单</CoverView>
        <CoverView className='float-time'>{formatCountdown(remainingTime)}</CoverView>
      </CoverView>
    </CoverView>
  )
}
