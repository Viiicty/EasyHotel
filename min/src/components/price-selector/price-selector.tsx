import React, { Component } from 'react'
import { View, Text, ScrollView, Button, Input, Slider } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './price-selector.scss'

interface PriceSelectorProps {
  visible: boolean
  minPrice: number
  maxPrice: number
  onConfirm: (minPrice: number, maxPrice: number) => void
  onClose: () => void
}

interface PriceSelectorState {
  tempMinPrice: string
  tempMaxPrice: string
  minSliderValue: number
  maxSliderValue: number
}

export default class PriceSelector extends Component<PriceSelectorProps, PriceSelectorState> {
  state: PriceSelectorState = {
    tempMinPrice: '0',
    tempMaxPrice: '2000',
    minSliderValue: 0,
    maxSliderValue: 20
  }

  isDraggingMin: boolean = false
  isDraggingMax: boolean = false
  sliderRect: any = null

  priceOptions = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2001]

  componentDidUpdate(prevProps: PriceSelectorProps) {
    if (prevProps.minPrice !== this.props.minPrice || prevProps.maxPrice !== this.props.maxPrice) {
      const minSliderValue = this.priceToSliderValue(this.props.minPrice)
      const maxSliderValue = this.priceToSliderValue(this.props.maxPrice)
      this.setState({
        tempMinPrice: this.props.minPrice === 0 ? '0' : (this.props.minPrice >= 2000 ? '2000以上' : this.props.minPrice.toString()),
        tempMaxPrice: this.props.maxPrice === 0 ? '0' : (this.props.maxPrice >= 2000 ? '2000以上' : this.props.maxPrice.toString()),
        minSliderValue,
        maxSliderValue
      })
    }
  }

  priceToSliderValue = (price: number): number => {
    if (price === 0) return 0
    if (price >= 2000) return 21
    return Math.floor(price / 100)
  }

  sliderValueToPrice = (value: number): number => {
    if (value === 0) return 0
    if (value >= 21) return 2001
    return value * 100
  }

  handleMinPriceChange = (e) => {
    const value = e.detail.value
    this.setState({ tempMinPrice: value })
  }

  handleMaxPriceChange = (e) => {
    const value = e.detail.value
    this.setState({ tempMaxPrice: value })
  }

  handleMinSliderChange = (e) => {
    const value = parseInt(e.detail.value)
    const { maxSliderValue } = this.state
    const clampedValue = Math.min(value, maxSliderValue - 1)
    const price = this.sliderValueToPrice(clampedValue)
    this.setState({
      minSliderValue: clampedValue,
      tempMinPrice: price === 0 ? '不限' : (price >= 2000 ? '2000以上' : price.toString())
    })
  }

  handleMaxSliderChange = (e) => {
    const value = parseInt(e.detail.value)
    const { minSliderValue } = this.state
    const clampedValue = Math.max(value, minSliderValue + 1)
    const price = this.sliderValueToPrice(clampedValue)
    this.setState({
      maxSliderValue: clampedValue,
      tempMaxPrice: price === 0 ? '不限' : (price >= 2000 ? '2000以上' : price.toString())
    })
  }

  handleMinSliderTouchStart = (e) => {
    this.isDraggingMin = true
    Taro.createSelectorQuery()
      .select('.price-sliders')
      .boundingClientRect((rect) => {
        if (rect) {
          this.sliderRect = rect
        }
      })
      .exec()
  }

  handleMinSliderTouchMove = (e) => {
    if (!this.isDraggingMin || !this.sliderRect) return
    const touch = e.touches[0]
    const rect = this.sliderRect
    const x = touch.clientX - rect.left - 20
    const percentage = Math.max(0, Math.min(1, x / (rect.width - 40)))
    const value = Math.round(percentage * 21)
    const { maxSliderValue, minSliderValue: prevMinValue } = this.state
    const clampedValue = Math.min(value, maxSliderValue - 1)
    if (clampedValue !== prevMinValue) {
      Taro.vibrateShort()
    }
    const price = this.sliderValueToPrice(clampedValue)
    this.setState({
      minSliderValue: clampedValue,
      tempMinPrice: price === 0 ? '0' : (price >= 2000 ? '2000以上' : price.toString())
    })
  }

  handleMinSliderTouchEnd = () => {
    this.isDraggingMin = false
    this.sliderRect = null
  }

  handleMaxSliderTouchStart = (e) => {
    this.isDraggingMax = true
    Taro.createSelectorQuery()
      .select('.price-sliders')
      .boundingClientRect((rect) => {
        if (rect) {
          this.sliderRect = rect
        }
      })
      .exec()
  }

  handleMaxSliderTouchMove = (e) => {
    if (!this.isDraggingMax || !this.sliderRect) return
    const touch = e.touches[0]
    const rect = this.sliderRect
    const x = touch.clientX - rect.left - 20
    const percentage = Math.max(0, Math.min(1, x / (rect.width - 40)))
    const value = Math.round(percentage * 21)
    const { minSliderValue, maxSliderValue: prevMaxValue } = this.state
    const clampedValue = Math.max(value, minSliderValue + 1)
    if (clampedValue !== prevMaxValue) {
      Taro.vibrateShort()
    }
    const price = this.sliderValueToPrice(clampedValue)
    this.setState({
      maxSliderValue: clampedValue,
      tempMaxPrice: price === 0 ? '0' : (price >= 2000 ? '2000以上' : price.toString())
    })
  }

  handleMaxSliderTouchEnd = () => {
    this.isDraggingMax = false
    this.sliderRect = null
  }

  handleConfirm = () => {
    const { tempMinPrice, tempMaxPrice, minSliderValue, maxSliderValue } = this.state
    const minPrice = this.sliderValueToPrice(minSliderValue)
    const maxPrice = this.sliderValueToPrice(maxSliderValue)
    this.props.onConfirm(minPrice, maxPrice)
    this.props.onClose()
  }

  render() {
    const { visible, onClose } = this.props
    const { tempMinPrice, tempMaxPrice } = this.state

    if (!visible) return null

    return (
      <View className='price-selector-mask' onClick={onClose}>
        <View className='price-selector-panel' onClick={(e) => e.stopPropagation()}>
          <View className='price-selector-header'>
            <Text className='price-selector-title'>价格区间</Text>
            <View className='price-selector-close' onClick={onClose}>✕</View>
          </View>

          <ScrollView scrollY className='price-selector-body'>
            <View className='price-slider-container'>
              <View className='price-sliders'>
                <View className='slider-track' />
                <View
                  className='slider-range'
                  style={{
                    left: `${(this.state.minSliderValue / 21) * 100}%`,
                    width: `${((this.state.maxSliderValue - this.state.minSliderValue) / 21) * 100}%`
                  }}
                />
                <View
                  className='custom-slider min-slider'
                  style={{ left: `${(this.state.minSliderValue / 21) * 100}%` }}
                  onTouchStart={this.handleMinSliderTouchStart}
                  onTouchMove={this.handleMinSliderTouchMove}
                  onTouchEnd={this.handleMinSliderTouchEnd}
                >
                  <View className='slider-thumb min-thumb' />
                </View>
                <View
                  className='custom-slider max-slider'
                  style={{ left: `${(this.state.maxSliderValue / 21) * 100}%` }}
                  onTouchStart={this.handleMaxSliderTouchStart}
                  onTouchMove={this.handleMaxSliderTouchMove}
                  onTouchEnd={this.handleMaxSliderTouchEnd}
                >
                  <View className='slider-thumb max-thumb' />
                </View>
              </View>
            </View>

            <View className='price-input-row'>
              <View className='price-input-item'>
                <Text className='price-label'>最低价格</Text>
                <Input
                  className='price-input'
                  type='text'
                  value={tempMinPrice}
                  onInput={this.handleMinPriceChange}
                />
              </View>
              <View className='price-input-item'>
                <Text className='price-label'>最高价格</Text>
                <Input
                  className='price-input'
                  type='text'
                  value={tempMaxPrice}
                  onInput={this.handleMaxPriceChange}
                />
              </View>
            </View>
          </ScrollView>

          <View className='price-selector-footer'>
            <Button className='price-selector-btn cancel-btn' onClick={onClose}>取消</Button>
            <Button className='price-selector-btn confirm-btn' onClick={this.handleConfirm}>确定</Button>
          </View>
        </View>
      </View>
    )
  }
}
