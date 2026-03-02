import React, { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import './skeleton.scss'

interface SkeletonProps {
  type?: 'banner' | 'card' | 'list'
  showContent?: boolean
}

const Skeleton: React.FC<SkeletonProps> = ({ type = 'card', showContent = false }) => {
  const [showShimmer, setShowShimmer] = useState(true)

  useEffect(() => {
    if (showContent) {
      const shimmerTimer = setTimeout(() => {
        setShowShimmer(false)
      }, 800)

      return () => {
        clearTimeout(shimmerTimer)
      }
    }
  }, [showContent])

  if (type === 'banner') {
    return (
      <View className='skeleton skeleton-banner'>
        {showShimmer && <View className='skeleton-shimmer' />}
      </View>
    )
  }

  if (type === 'card') {
    return (
      <View className='skeleton skeleton-card'>
        <View className='skeleton-image'>
          {showShimmer && <View className='skeleton-shimmer' />}
        </View>
        <View className='skeleton-content'>
          <View className='skeleton-title'>
            {showShimmer && <View className='skeleton-shimmer' />}
          </View>
          <View className='skeleton-subtitle'>
            {showShimmer && <View className='skeleton-shimmer' />}
          </View>
          <View className='skeleton-info'>
            <View className='skeleton-info-stars'>
              {showShimmer && <View className='skeleton-shimmer' />}
            </View>
            <View className='skeleton-info-address'>
              {showShimmer && <View className='skeleton-shimmer' />}
            </View>
          </View>
          <View className='skeleton-tags'>
            <View className='skeleton-tag'>
              {showShimmer && <View className='skeleton-shimmer' />}
            </View>
            <View className='skeleton-tag'>
              {showShimmer && <View className='skeleton-shimmer' />}
            </View>
            <View className='skeleton-tag'>
              {showShimmer && <View className='skeleton-shimmer' />}
            </View>
            <View className='skeleton-tag'>
              {showShimmer && <View className='skeleton-shimmer' />}
            </View>
          </View>
          <View className='skeleton-price'>
            {showShimmer && <View className='skeleton-shimmer' />}
          </View>
        </View>
      </View>
    )
  }

  return null
}

export default Skeleton
