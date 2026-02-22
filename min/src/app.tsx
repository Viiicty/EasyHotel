import React, { useState, useEffect } from 'react'
import { useLaunch } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { orderService } from './services/order.service'
import { userService } from './services/user.service'
import './app.scss'

function App(props) {
  useLaunch(() => {
    console.log('=== App useLaunch ===')
    console.log('App launched.')
  })

  return props.children
}

export default App
