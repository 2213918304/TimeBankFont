const { authManager } = require('../../utils/auth.js')

Page({
  data: {
    userInfo: null
  },
  
  onLoad(options) {
    console.log('监控页面加载，参数:', options)
    
    // 路由守卫：检查登录状态
    if (!authManager.isLoggedIn()) {
      console.log('用户未登录，跳转到登录页')
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    
    // 获取用户信息
    const userInfo = authManager.getUserInfo()
    if (userInfo) {
      this.setData({
        userInfo
      })
    }
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
    
    console.log('监控页导航点击，索引:', navIndex)
    
    // 家属端导航路由
    const routes = [
      '/pages/index/index',      // 0: 首页
      '/pages/services/services', // 1: 服务
      '/pages/monitor/monitor',  // 2: 监控
      '/pages/wallet/wallet',    // 3: 时间币
      '/pages/profile/profile'   // 4: 我的
    ]
    
    // 如果是当前页面，不做跳转
    if (navIndex === 2) {
      console.log('当前已在监控页，不执行跳转')
      return
    }
    
    // 执行页面跳转
    const targetRoute = routes[navIndex]
    if (targetRoute) {
      wx.navigateTo({
        url: targetRoute + '?role=family'
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
   * 刷新数据
   */
  refreshData() {
    wx.showToast({
      title: '数据已刷新',
      icon: 'success'
    })
  },
  
  /**
   * 显示位置详情
   */
  showLocation() {
    wx.showModal({
      title: '详细位置',
      content: '辽宁省大连市辽宁师范大学西山校区三公寓216\n\n经度：121.123456\n纬度：38.654321\n\n最后更新时间：2024-12-22 14:30:25',
      confirmText: '导航到此',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) {
          wx.openLocation({
            latitude: 38.654321,
            longitude: 121.123456,
            name: '老人位置',
            address: '辽宁省大连市辽宁师范大学西山校区三公寓216'
          }).catch(err => {
            console.error('打开地图失败:', err)
            wx.showToast({
              title: '地图功能暂不可用',
              icon: 'none'
            })
          })
        }
      }
    })
  },
  
  /**
   * 紧急呼叫
   */
  emergencyCall() {
    wx.showModal({
      title: '🚨 紧急呼叫',
      content: '是否立即拨打老人的紧急联系电话？',
      confirmText: '立即拨打',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '13800138000'
          }).catch(err => {
            console.error('拨打电话失败:', err)
            wx.showToast({
              title: '拨打电话失败',
              icon: 'none'
            })
          })
        }
      }
    })
  },
  
  /**
   * 发送紧急短信
   */
  sendEmergencySMS() {
    wx.showModal({
      title: '📱 紧急短信',
      content: '将向老人发送紧急关怀短信，确认发送吗？',
      confirmText: '发送',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '紧急短信已发送',
            icon: 'success'
          })
        }
      }
    })
  },
  
  /**
   * 拨打联系人电话
   */
  callContact(e) {
    const phone = e.currentTarget.dataset.phone
    console.log('拨打联系人电话:', phone)
    
    wx.showModal({
      title: '📞 拨打电话',
      content: `确认拨打电话 ${phone} 吗？`,
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: phone
          }).catch(err => {
            console.error('拨打电话失败:', err)
            wx.showToast({
              title: '拨打电话失败',
              icon: 'none'
            })
          })
        }
      }
    })
  }
})