import Taro from '@tarojs/taro'

const USER_TOKEN_KEY = 'userToken'
const USER_ID_KEY = 'userId'
const USER_INFO_KEY = 'userInfo'

export interface UserInfo {
  id?: string
  token?: string
  name?: string
  phone?: string
  idCard?: string
}

export const userService = {
  getToken: (): string | undefined => {
    try {
      return Taro.getStorageSync(USER_TOKEN_KEY)
    } catch (error) {
      console.error('获取token失败:', error)
      return undefined
    }
  },

  getUserId: (): string | undefined => {
    try {
      return Taro.getStorageSync(USER_ID_KEY)
    } catch (error) {
      console.error('获取userId失败:', error)
      return undefined
    }
  },

  getUserInfo: (): UserInfo | undefined => {
    try {
      return Taro.getStorageSync(USER_INFO_KEY)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return undefined
    }
  },

  setUserInfo: (userInfo: UserInfo) => {
    try {
      if (userInfo.token) {
        Taro.setStorageSync(USER_TOKEN_KEY, userInfo.token)
      }
      if (userInfo.id) {
        Taro.setStorageSync(USER_ID_KEY, userInfo.id)
      }
      if (userInfo.name || userInfo.phone || userInfo.idCard) {
        const existingInfo = userService.getUserInfo() || {}
        const newInfo = {
          ...existingInfo,
          name: userInfo.name,
          phone: userInfo.phone,
          idCard: userInfo.idCard
        }
        Taro.setStorageSync(USER_INFO_KEY, newInfo)
      }
    } catch (error) {
      console.error('保存用户信息失败:', error)
    }
  },

  clearUserInfo: () => {
    try {
      Taro.removeStorageSync(USER_TOKEN_KEY)
      Taro.removeStorageSync(USER_ID_KEY)
      Taro.removeStorageSync(USER_INFO_KEY)
    } catch (error) {
      console.error('清除用户信息失败:', error)
    }
  },

  isLoggedIn: (): boolean => {
    const token = userService.getToken()
    const userId = userService.getUserId()
    return !!(token && userId)
  }
}
