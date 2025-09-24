/**
 * 认证工具类
 * 处理用户登录状态和token管理
 */

const api = require('./api.js')

/**
 * 认证API接口
 */
const authAPI = {
  /**
   * 用户登录
   */
  login(data) {
    return api.post('/auth/login', data)
  },
  
  /**
   * 用户注册
   */
  register(data) {
    return api.post('/auth/register', data)
  },
  
  /**
   * 获取用户信息
   */
  getUserInfo(userId) {
    return api.get('/auth/user-info', { userId })
  },
  
  /**
   * 刷新Token
   */
  refreshToken() {
    return api.post('/auth/refresh-token')
  },
  
  /**
   * 用户登出
   */
  logout(userId) {
    return api.post('/auth/logout', { userId })
  }
}

/**
 * 认证状态管理
 */
const authManager = {
  /**
   * 检查是否已登录
   */
  isLoggedIn() {
    const token = wx.getStorageSync('access_token')
    const userInfo = wx.getStorageSync('user_info')
    return !!(token && userInfo)
  },
  
  /**
   * 获取用户信息
   */
  getUserInfo() {
    return wx.getStorageSync('user_info') || null
  },
  
  /**
   * 获取token
   */
  getToken() {
    return wx.getStorageSync('access_token') || null
  },
  
  /**
   * 保存登录信息
   */
  saveLoginInfo(loginResponse) {
    const { accessToken, ...userInfo } = loginResponse
    wx.setStorageSync('access_token', accessToken)
    wx.setStorageSync('user_info', userInfo)
    console.log('登录信息已保存:', userInfo)
  },
  
  /**
   * 清除登录信息
   */
  clearLoginInfo() {
    wx.removeStorageSync('access_token')
    wx.removeStorageSync('user_info')
    console.log('登录信息已清除')
  },

  /**
   * 更新用户信息
   */
  updateUserInfo(updatedInfo) {
    try {
      const currentUserInfo = this.getUserInfo()
      if (currentUserInfo) {
        const newUserInfo = {
          ...currentUserInfo,
          ...updatedInfo
        }
        wx.setStorageSync('user_info', newUserInfo)
        console.log('用户信息已更新:', newUserInfo)
        return newUserInfo
      }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  },
  
  /**
   * 登录
   */
  async login(loginData) {
    try {
      const response = await authAPI.login(loginData)
      if (response.success || response.code === 200) {
        this.saveLoginInfo(response.data)
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  },
  
  /**
   * 注册
   */
  async register(registerData) {
    try {
      const response = await authAPI.register(registerData)
      if (response.success || response.code === 200) {
        this.saveLoginInfo(response.data)
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || '注册失败')
      }
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  },
  
  /**
   * 登出
   */
  async logout() {
    try {
      const userInfo = this.getUserInfo()
      if (userInfo && userInfo.userId) {
        // 尝试调用后端登出接口，但不依赖其成功
        try {
          await authAPI.logout(userInfo.userId)
          console.log('后端登出成功')
        } catch (apiError) {
          console.warn('后端登出接口调用失败，但继续清除本地信息:', apiError)
          // 不抛出错误，继续执行本地清理
        }
      }
    } catch (error) {
      console.error('登出过程中出现错误:', error)
    } finally {
      // 无论后端接口是否成功，都清除本地登录信息
      this.clearLoginInfo()
      console.log('本地登录信息已清除')
    }
  },
  
  /**
   * 检查登录状态，如果未登录则跳转到登录页
   */
  checkLogin() {
    if (!this.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return false
    }
    return true
  },
  
  /**
   * 获取当前用户角色
   */
  getUserRole() {
    const userInfo = this.getUserInfo()
    return userInfo ? userInfo.role : null
  },
  
  /**
   * 转换用户角色到界面角色
   * 家属和志愿者都属于family端
   */
  getRoleFromUserRole(userRole) {
    switch(userRole) {
      case 'ELDERLY':
        return 'elderly'
      case 'FAMILY_MEMBER':
      case 'VOLUNTEER':
        return 'family'  // 统一为family端（志愿者端）
      default:
        return 'elderly'
    }
  },
  
  /**
   * 检查是否为志愿者（包含家属）
   */
  isVolunteer() {
    const userInfo = this.getUserInfo()
    return userInfo && (userInfo.role === 'FAMILY_MEMBER' || userInfo.role === 'VOLUNTEER')
  },
  
  /**
   * 检查是否为老人
   */
  isElderly() {
    const userInfo = this.getUserInfo()
    return userInfo && userInfo.role === 'ELDERLY'
  }
}

// 为了兼容不同的引用方式，同时导出多种格式
module.exports = {
  authAPI,
  authManager,
  // 直接导出常用方法，方便使用
  isLoggedIn: authManager.isLoggedIn.bind(authManager),
  getUserInfo: authManager.getUserInfo.bind(authManager),
  getToken: authManager.getToken.bind(authManager),
  login: authManager.login.bind(authManager),
  register: authManager.register.bind(authManager),
  logout: authManager.logout.bind(authManager),
  checkLogin: authManager.checkLogin.bind(authManager),
  getUserRole: authManager.getUserRole.bind(authManager),
  isVolunteer: authManager.isVolunteer.bind(authManager),
  isElderly: authManager.isElderly.bind(authManager)
}
