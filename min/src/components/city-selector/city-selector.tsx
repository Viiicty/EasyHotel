import React, { Component } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import './city-selector.scss'

interface CitySelectorProps {
  visible: boolean
  selectedCity: string
  onConfirm: (city: string) => void
  onClose: () => void
}

export default class CitySelector extends Component<CitySelectorProps> {
  cities = ['不限', '北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '武汉', '西安', '南京', '苏州', '天津', '青岛', '厦门', '大连', '三亚', '丽江', '桂林', '昆明', '长沙', '郑州', '济南', '沈阳', '哈尔滨']

  handleCityClick = (city: string) => {
    this.props.onConfirm(city)
  }

  render() {
    const { visible, selectedCity, onClose } = this.props

    if (!visible) return null

    return (
      <View className='city-selector-mask' onClick={onClose}>
        <View className='city-selector-panel' onClick={(e) => e.stopPropagation()}>
          <View className='city-selector-header'>
            <Text className='city-selector-title'>选择城市</Text>
            <View className='city-selector-close' onClick={onClose}>✕</View>
          </View>

          <ScrollView scrollY className='city-selector-body'>
            <View className='city-list'>
              {this.cities.map((city, index) => (
                <View
                  key={index}
                  className={`city-item ${selectedCity === (city === '不限' ? '' : city) ? 'active' : ''}`}
                  onClick={() => this.handleCityClick(city)}
                >
                  <Text className='city-name'>{city}</Text>
                  {selectedCity === (city === '不限' ? '' : city) && (
                    <Text className='city-check'>✓</Text>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    )
  }
}
