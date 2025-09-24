const { authManager } = require('../../utils/auth.js')

Page({
  data: {
    isElderly: false,
    userInfo: null
  },
  
  onLoad(options) {
    console.log('服务页面加载，参数:', options)
    
    // 路由守卫：检查登录状态
    if (!authManager.isLoggedIn()) {
      console.log('用户未登录，跳转到登录页')
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    
    // 获取用户信息并设置角色
    this.initUserRole(options)
  },
  
  onShow() {
    // 每次显示时也检查登录状态
    if (!authManager.isLoggedIn()) {
      console.log('用户未登录，跳转到登录页')
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
  },
  
  /**
   * 初始化用户角色
   */
  initUserRole(options) {
    const userInfo = authManager.getUserInfo()
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    
    // 根据参数或用户信息设置角色
    let isElderly = false
    if (options && options.role) {
      isElderly = options.role === 'elderly'
    } else {
      isElderly = userInfo.role === 'ELDERLY'
    }
    
    this.setData({
      userInfo,
      isElderly
    })
  },
  
  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.redirectTo({
          url: '/pages/index/index'
        })
      }
    })
  },
  
  /**
   * 底部导航切换
   */
  onNavChange(e) {
    const navIndex = e.detail
    const { isElderly } = this.data
    
    console.log('服务页导航点击，索引:', navIndex, '是否老人端:', isElderly)
    
    // 根据角色定义导航路由
    let routes = []
    if (isElderly) {
      routes = [
        '/pages/index/index',      // 0: 首页
        '/pages/services/services', // 1: 服务
        '/pages/chat/chat',        // 2: 助手 
        '/pages/wallet/wallet',    // 3: 时间币
        '/pages/elderly-profile/elderly-profile'   // 4: 我的
      ]
    } else {
      routes = [
        '/pages/index/index',      // 0: 首页
        '/pages/services/services', // 1: 服务
        '/pages/monitor/monitor',  // 2: 监控
        '/pages/wallet/wallet',    // 3: 时间币
        '/pages/profile/profile'   // 4: 我的
      ]
    }
    
    // 如果是当前页面，不做跳转
    if (navIndex === 1) {
      console.log('当前已在服务页，不执行跳转')
      return
    }
    
    // 执行页面跳转
    const targetRoute = routes[navIndex]
    if (targetRoute) {
      wx.navigateTo({
        url: targetRoute + '?role=' + (isElderly ? 'elderly' : 'family')
      }).catch(err => {
        console.error('导航失败:', err)
        wx.showToast({
          title: '页面开发中',
          icon: 'none'
        })
      })
    }
  },
  
  /**
   * 跳转到接单大厅
   */
  goToOrderHall() {
    console.log('跳转到接单大厅')
    wx.navigateTo({
      url: '/pages/order/order?role=family'
    }).catch(err => {
      console.error('跳转失败:', err)
      wx.showToast({
        title: '页面开发中',
        icon: 'none'
      })
    })
  },
  
  /**
   * 联系志愿者
   */
  contactVolunteer() {
    wx.showToast({
      title: '正在联系志愿者...',
      icon: 'none'
    })
  },
  
  /**
   * 语音发布需求
   */
  goToVoicePublish() {
    console.log('跳转到语音发布')
    wx.navigateTo({
      url: '/pages/publish/publish?type=voice&role=elderly'
    }).catch(err => {
      console.error('跳转失败:', err)
      wx.showToast({
        title: '页面开发中',
        icon: 'none'
      })
    })
  },
  
  /**
   * 手动发布需求
   */
  goToManualPublish() {
    console.log('跳转到手动发布')
    wx.navigateTo({
      url: '/pages/publish/publish?type=manual&role=elderly'
    }).catch(err => {
      console.error('跳转失败:', err)
      wx.showToast({
        title: '页面开发中',
        icon: 'none'
      })
    })
  },
  
  /**
   * 快捷发布服务
   */
  quickPublish(e) {
    const serviceType = e.currentTarget.dataset.service
    console.log('快捷发布服务:', serviceType)
    wx.showToast({
      title: `正在发布${serviceType}需求...`,
      icon: 'none'
    })
  }
})