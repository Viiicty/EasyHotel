import React, { useState, useEffect, useRef } from 'react'
import { Text } from '@tarojs/components'

interface CountdownTimerProps {
  initialTime: number
  onTick?: (time: number) => void
  onExpire?: () => void
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialTime, onTick, onExpire }) => {
  const [remainingTime, setRemainingTime] = useState(initialTime)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    setRemainingTime(initialTime)
  }, [initialTime])

  useEffect(() => {
    if (remainingTime <= 0) {
      if (onExpire) {
        onExpire()
      }
      return
    }

    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = prev - 1
        if (onTick) {
          onTick(newTime)
        }
        if (newTime <= 0) {
          clearInterval(timerRef.current)
          if (onExpire) {
            onExpire()
          }
        }
        return newTime
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [remainingTime, onTick, onExpire])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (remainingTime <= 0) {
    return null
  }

  return (
    <Text className='bookmark-time'>{formatTime(remainingTime)}</Text>
  )
}

export default CountdownTimer
