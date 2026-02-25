import React from 'react'
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import './image-preview.scss'

interface ImagePreviewProps {
  visible: boolean
  images: string[]
  currentIndex: number
  onClose: () => void
  onChange?: (index: number) => void
}

export default function ImagePreview({ visible, images, currentIndex, onClose, onChange }: ImagePreviewProps) {
  if (!visible || images.length === 0) {
    return null
  }

  const handleChange = (e: any) => {
    if (onChange) {
      onChange(e.detail.current)
    }
  }

  return (
    <View className='image-preview-container'>
      <View className='image-preview-content'>
        <View className='preview-close-btn' onClick={onClose}>
          <Text className='close-icon'>✕</Text>
        </View>
        <Swiper
          className='image-swiper'
          current={currentIndex}
          onChange={handleChange}
          indicatorDots
          indicatorColor='rgba(255, 255, 255, 0.3)'
          indicatorActiveColor='#fff'
          circular
          catchMove
        >
          {images.map((imageUrl, index) => (
            <SwiperItem key={index}>
              <View className='swiper-item'>
                <Image
                  className='preview-image'
                  src={imageUrl}
                  mode='aspectFit'
                  onClick={onClose}
                />
              </View>
            </SwiperItem>
          ))}
        </Swiper>
        <View className='preview-counter'>
          <Text className='counter-text'>{currentIndex + 1} / {images.length}</Text>
        </View>
      </View>
    </View>
  )
}
