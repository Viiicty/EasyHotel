import { useState } from 'react'
import { Button, Space, message } from 'antd'
import { AimOutlined, EnvironmentOutlined } from '@ant-design/icons'

const API_BASE = '/api'
const AMAP_KEY = 'cbb0e9da5dc2bd7edb1d5cb63af8e039'

// 城市拼音映射表
const cityPinyinMap = {
  '北京': 'beijing',
  '上海': 'shanghai',
  '广州': 'guangzhou',
  '深圳': 'shenzhen',
  '杭州': 'hangzhou',
  '成都': 'chengdu',
  '重庆': 'chongqing',
  '武汉': 'wuhan',
  '西安': 'xian',
  '南京': 'nanjing',
  '苏州': 'suzhou',
  '天津': 'tianjin',
  '青岛': 'qingdao',
  '厦门': 'xiamen',
  '大连': 'dalian',
  '三亚': 'sanya',
  '丽江': 'lijiang',
  '桂林': 'guilin',
  '昆明': 'kunming',
  '长沙': 'changsha',
  '郑州': 'zhengzhou',
  '济南': 'jinan',
  '沈阳': 'shenyang',
  '哈尔滨': 'haerbin'
}

function LocationPicker({ form, fieldNames = { lat: 'lat', lng: 'lng', city: 'cityCode', address: 'address' } }) {
  const [locating, setLocating] = useState(false)

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      message.error('您的浏览器不支持地理定位')
      return
    }

    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log('定位成功:', { latitude, longitude })
        
        // 填充经纬度
        form.setFieldsValue({
          [fieldNames.lat]: latitude.toFixed(6),
          [fieldNames.lng]: longitude.toFixed(6)
        })

        // 逆地理编码获取地址和城市
        reverseGeocode(latitude, longitude)
      },
      (error) => {
        setLocating(false)
        console.error('定位失败:', error)
        
        let errorMsg = '定位失败'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = '用户拒绝了地理定位请求'
            break
          case error.POSITION_UNAVAILABLE:
            errorMsg = '位置信息不可用'
            break
          case error.TIMEOUT:
            errorMsg = '定位超时'
            break
          default:
            errorMsg = '定位失败，请检查浏览器权限'
        }
        message.error(errorMsg)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const url = `${API_BASE}/mini/hotel/location?location=${longitude},${latitude}&key=${AMAP_KEY}`
      
      const response = await fetch(url)
      const result = await response.json()

      if (response.ok && result.code === 200 && result.data.status === '1') {
        const regeocode = result.data.regeocode
        const addressComponent = regeocode.addressComponent
        
        const province = addressComponent.province
        const city = (addressComponent.city && addressComponent.city.length > 0) 
          ? addressComponent.city 
          : addressComponent.province
        const district = addressComponent.district
        const street = addressComponent.street
        const streetNumber = addressComponent.streetNumber
        
        // 构建地址
        const formattedAddress = regeocode.formatted_address
        
        // 获取城市拼音
        const cityPinyin = cityPinyinMap[city] || ''
        
        // 更新表单
        const updates = {}
        if (fieldNames.address) {
          updates[fieldNames.address] = formattedAddress
        }
        if (fieldNames.city && cityPinyin) {
          updates[fieldNames.city] = cityPinyin
        }
        
        form.setFieldsValue(updates)
        
        message.success(`定位成功：${city} ${district}`)
      } else {
        message.warning('获取地址信息失败，请手动填写')
      }
    } catch (error) {
      console.error('逆地理编码失败:', error)
      message.warning('获取地址信息失败，请手动填写')
    } finally {
      setLocating(false)
    }
  }

  return (
    <Button 
      icon={<AimOutlined />} 
      onClick={handleGetLocation}
      loading={locating}
    >
      {locating ? '定位中...' : '自动定位'}
    </Button>
  )
}

export default LocationPicker
