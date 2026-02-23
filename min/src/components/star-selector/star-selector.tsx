import React, { Component } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import './star-selector.scss'

interface StarSelectorProps {
  visible: boolean
  starLevel: number
  onConfirm: (starLevel: number) => void
  onClose: () => void
}

export default class StarSelector extends Component<StarSelectorProps> {
  state = {
    tempStarLevel: 0
  }

  componentDidMount() {
    this.setState({ tempStarLevel: this.props.starLevel })
  }

  componentDidUpdate(prevProps: StarSelectorProps) {
    if (prevProps.starLevel !== this.props.starLevel) {
      this.setState({ tempStarLevel: this.props.starLevel })
    }
  }

  handleStarClick = (star: number) => {
    this.setState({ tempStarLevel: star })
  }

  handleUnlimitedClick = () => {
    this.setState({ tempStarLevel: 0 })
  }

  handleConfirm = () => {
    this.props.onConfirm(this.state.tempStarLevel)
    this.props.onClose()
  }

  render() {
    const { visible, onClose } = this.props
    const { tempStarLevel } = this.state

    if (!visible) return null

    return (
      <View className='star-selector-mask' onClick={onClose}>
        <View className='star-selector-panel' onClick={(e) => e.stopPropagation()}>
          <View className='star-selector-header'>
            <Text className='star-selector-title'>选择星级</Text>
            <View className='star-selector-close' onClick={onClose}>✕</View>
          </View>

          <View className='star-selector-body'>
            <View className='star-rating-container'>
              <View className='star-rating'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <View
                    key={star}
                    className={`star ${tempStarLevel >= star ? 'active' : ''}`}
                    onClick={() => this.handleStarClick(star)}
                  >
                    <Text className='star-icon'>{tempStarLevel >= star ? '★' : '☆'}</Text>
                  </View>
                ))}
              </View>
              <Text className='star-rating-text'>
                {tempStarLevel === 0 ? '不限' : `${tempStarLevel}星级`}
              </Text>
            </View>
          </View>

          <View className='star-selector-footer'>
            <Button className='star-selector-btn cancel-btn' onClick={this.handleUnlimitedClick}>不限</Button>
            <Button className='star-selector-btn confirm-btn' onClick={this.handleConfirm}>确定</Button>
          </View>
        </View>
      </View>
    )
  }
}
