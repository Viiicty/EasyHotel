import React from 'react'
import { View } from '@tarojs/components'
import './skeleton.scss'

interface SkeletonProps {
  type?: 'banner' | 'card' | 'list'
}

const Skeleton: React.FC<SkeletonProps> = ({ type = 'card' }) => {
  if (type === 'banner') {
    return (
      <View className='skeleton skeleton-banner'>
        <View className='skeleton-shimmer' />
      </View>
    )
  }

  if (type === 'card') {
    return (
      <View className='skeleton skeleton-card'>
        <View className='skeleton-image'>
          <View className='skeleton-shimmer' />
        </View>
        <View className='skeleton-content'>
          <View className='skeleton-title'>
            <View className='skeleton-shimmer' />
          </View>
          <View className='skeleton-text'>
            <View className='skeleton-shimmer' />
          </View>
          <View className='skeleton-text'>
            <View className='skeleton-shimmer' />
          </View>
          <View className='skeleton-tags'>
            <View className='skeleton-tag'>
              <View className='skeleton-shimmer' />
            </View>
            <View className='skeleton-tag'>
              <View className='skeleton-shimmer' />
            </View>
            <View className='skeleton-tag'>
              <View className='skeleton-shimmer' />
            </View>
          </View>
        </View>
      </View>
    )
  }

  return null
}

export default Skeleton
