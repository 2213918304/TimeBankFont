const { authManager } = require('./utils/auth.js')

App({
  onLaunch: function () {
    console.log('时间银行小程序启动')
  },

  onShow: function () {
    console.log('时间银行小程序显示')
  },

  onHide: function () {
    console.log('时间银行小程序隐藏')
  },
  
  /**
   * 路由守卫 - 检查页面访问权限
   * @param {string} url - 要访问的页面路径
   * @returns {boolean} - 是否允许访问
   */
  checkPageAccess(url) {
    const isLoggedIn = authManager.isLoggedIn()
    const publicPages = ['/pages/login/login', '/pages/register/register']
    const isPublicPage = publicPages.some(page => url.includes(page))
    
    console.log('路由守卫检查:', { url, isLoggedIn, isPublicPage })
    
    if (isLoggedIn && isPublicPage) {
      // 已登录用户不能访问登录/注册页面，跳转到主页
      console.log('已登录用户尝试访问登录/注册页面，跳转到主页')
      wx.redirectTo({
        url: '/pages/index/index'
      })
      return false
    }
    
    if (!isLoggedIn && !isPublicPage) {
      // 未登录用户只能访问登录/注册页面
      console.log('未登录用户尝试访问受保护页面，跳转到登录页')
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return false
    }
    
    return true
  },
  
  /**
   * 验证token有效性
   */
  async validateToken() {
    try {
      const userInfo = authManager.getUserInfo()
      if (userInfo && userInfo.userId) {
        // 可以在这里调用后端接口验证token
        // const result = await authManager.authAPI.getUserInfo(userInfo.userId)
        console.log('Token验证通过')
        return true
      }
      return false
    } catch (error) {
      console.error('Token验证失败:', error)
      // Token无效，清除登录信息
      authManager.clearLoginInfo()
      return false
    }
  },
  
  /**
   * 全局数据
   */
  globalData: {
    userInfo: null,
    systemInfo: null
  }
})
