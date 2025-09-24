const { authManager } = require('../../utils/auth.js')

Page({
  data: {
    currentRole: "elderly", // 默认老人端，根据用户角色动态设置
    userInfo: null,
    isElderly: true,
    
    // 聊天数据（老人端AI助手）
    messages: [{
      type: "ai",
      content: "您好！我是您的专属AI助手小罗。我可以帮您发布服务需求、回答问题、提供健康建议。有什么需要帮助的吗？"
    }],
    inputText: "",
    isTyping: false,
    scrollTop: 0
  },
  
  onLoad(options) {
    console.log('首页加载，参数:', options)
    
    // 路由守卫：检查登录状态
    if (!authManager.isLoggedIn()) {
      console.log('用户未登录，跳转到登录页')
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    
    // 根据用户角色设置界面
    this.initUserRole()
  },
  
  onShow() {
    console.log('首页显示')
    
    // 每次显示页面时检查登录状态
    if (!authManager.isLoggedIn()) {
      console.log('用户未登录，跳转到登录页')
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    
    // 刷新用户信息
    this.initUserRole()
  },
  
  /**
   * 初始化用户角色和界面
   */
  initUserRole() {
    const userInfo = authManager.getUserInfo()
    console.log('获取到的用户信息:', userInfo)
    
    if (!userInfo) {
      console.log('用户信息为空，跳转到登录页')
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    
    // 根据用户角色设置界面
    let currentRole, isElderly
    
    switch(userInfo.role) {
      case 'ELDERLY':
        currentRole = 'elderly'
        isElderly = true
        break
      case 'FAMILY_MEMBER':
      case 'VOLUNTEER':
        currentRole = 'family'  // 统一为family端（志愿者端）
        isElderly = false
        break
      default:
        // 默认为老人端
        currentRole = 'elderly'
        isElderly = true
    }
    
    console.log('用户角色设置:', {
      userRole: userInfo.role,
      currentRole,
      isElderly
    })
    
    this.setData({
      userInfo,
      currentRole,
      isElderly
    })
  },
  
  /**
   * 获取用户显示名称
   */
  getUserDisplayName() {
    const { userInfo } = this.data
    if (!userInfo) return '用户'
    
    // 优先显示真实姓名，其次用户名，最后显示手机号
    if (userInfo.name) {
      return userInfo.name
    } else if (userInfo.realName) {
      return userInfo.realName
    } else if (userInfo.username) {
      return userInfo.username
    } else if (userInfo.phone) {
      // 隐藏手机号中间四位
      const phone = userInfo.phone
      return phone.substring(0, 3) + '****' + phone.substring(7)
    } else {
      return '用户'
    }
  },
  
  /**
   * 拨打电话
   */
  callElder() {
    wx.makePhoneCall({
      phoneNumber: '138****5678',
      success: () => {
        console.log('拨打电话成功')
      },
      fail: (err) => {
        console.error('拨打电话失败:', err)
        wx.showToast({
          title: '拨打失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 快捷操作 - 发布需求
   */
  publishNeed() {
    console.log('发布需求')
    wx.navigateTo({
      url: '/pages/publish/publish'
    })
  },

  /**
   * 快捷操作 - 查看订单
   */
  viewOrders() {
    console.log('查看订单')
    wx.navigateTo({
      url: '/pages/order/order'
    })
  },

  /**
   * 快捷操作 - 时间钱包
   */
  openWallet() {
    console.log('时间钱包')
    wx.navigateTo({
      url: '/pages/wallet/wallet'
    })
  },

  /**
   * 快捷操作 - 服务大厅
   */
  openServices() {
    console.log('服务大厅')
    wx.navigateTo({
      url: '/pages/services/services'
    })
  },

  /**
   * 快捷操作 - 实时监控
   */
  openMonitor() {
    console.log('实时监控')
    wx.navigateTo({
      url: '/pages/monitor/monitor'
    })
  },

  /**
   * 快捷操作 - 聊天沟通
   */
  openChat() {
    console.log('聊天沟通')
    wx.navigateTo({
      url: '/pages/chat/chat'
    })
  },

  /**
   * 老人端快捷操作 - 呼叫服务
   */
  callService() {
    console.log('呼叫服务')
    wx.showModal({
      title: '呼叫服务',
      content: '您要呼叫什么服务？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: (res) => {
        if (res.confirm) {
          // 跳转到发布需求页面
          wx.navigateTo({
            url: '/pages/publish/publish?type=emergency'
          })
        }
      }
    })
  },

  /**
   * 老人端快捷操作 - 查看礼品
   */
  viewGifts() {
    console.log('查看礼品')
    wx.navigateTo({
      url: '/pages/gifts/gifts'
    })
  },

  /**
   * 跳转到服务页面
   */
  goToServices() {
    console.log('跳转到服务页面')
    const { isElderly } = this.data
    wx.navigateTo({
      url: '/pages/services/services?role=' + (isElderly ? 'elderly' : 'family')
    })
  },

  /**
   * 跳转到聊天页面
   */
  goToChat() {
    console.log('跳转到聊天页面')
    const { isElderly } = this.data
    wx.navigateTo({
      url: '/pages/chat/chat?role=' + (isElderly ? 'elderly' : 'family')
    })
  },

  /**
   * 跳转到钱包页面
   */
  goToWallet() {
    console.log('跳转到钱包页面')
    const { isElderly } = this.data
    wx.navigateTo({
      url: '/pages/wallet/wallet?role=' + (isElderly ? 'elderly' : 'family')
    })
  },

  /**
   * 跳转到发布页面
   */
  goToPublish() {
    console.log('跳转到发布页面')
    wx.navigateTo({
      url: '/pages/publish/publish?role=family'
    })
  },

  /**
   * 跳转到充值页面
   */
  goToRecharge() {
    console.log('跳转到充值页面')
    wx.navigateTo({
      url: '/pages/recharge/recharge?role=family'
    })
  },

  /**
   * 紧急呼叫
   */
  emergencyCall() {
    console.log('紧急呼叫')
    wx.showModal({
      title: '🚨 紧急呼叫',
      content: '是否立即拨打紧急联系电话？',
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
   * 刷新数据
   */
  refreshData() {
    console.log('刷新数据')
    wx.showToast({
      title: '数据已刷新',
      icon: 'success'
    })
  },

  /**
   * AI助手 - 发送消息
   */
  sendMessage() {
    const { inputText } = this.data
    if (!inputText.trim()) {
      return
    }

    // 添加用户消息
    const userMessage = {
      type: "user",
      content: inputText.trim(),
      time: new Date().toLocaleTimeString()
    }

    this.setData({
      messages: [...this.data.messages, userMessage],
      inputText: "",
      isTyping: true
    })

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage = {
        type: "ai",
        content: this.getAIResponse(inputText.trim()),
        time: new Date().toLocaleTimeString()
      }

      this.setData({
        messages: [...this.data.messages, aiMessage],
        isTyping: false,
        scrollTop: 9999999
      })
    }, 1500)

    // 滚动到底部
    this.setData({
      scrollTop: 9999999
    })
  },

  /**
   * 输入框变化
   */
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    })
  },

  /**
   * 模拟AI回复
   */
  getAIResponse(userInput) {
    const responses = [
      "我理解您的需求，正在为您匹配合适的服务志愿者...",
      "根据您的描述，我建议您可以发布一个服务需求，会有专业的志愿者为您提供帮助。",
      "您可以点击下方的'发布需求'按钮，详细说明您需要的服务。",
      "如果是紧急情况，您可以直接拨打紧急服务电话：400-888-9999",
      "我已经为您记录了这个需求，稍后会有志愿者主动联系您。"
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  },

  /**
   * 退出登录
   */
  async logout() {
    try {
      wx.showModal({
        title: '确认退出',
        content: '您确定要退出登录吗？',
        success: async (res) => {
          if (res.confirm) {
            await authManager.logout()
            wx.reLaunch({
              url: '/pages/login/login'
            })
          }
        }
      })
    } catch (error) {
      console.error('退出登录失败:', error)
      wx.showToast({
        title: '退出失败',
        icon: 'none'
      })
    }
  },

  /**
   * 底部导航栏点击事件
   */
  onNavChange(e) {
    const index = e.detail
    console.log('首页底部导航点击:', index)
    
    const { isElderly } = this.data
    
    if (isElderly) {
      // 老人端导航
      switch(index) {
        case 0: // 首页
          // 当前页面，不需要跳转
          break
        case 1: // 服务
          wx.navigateTo({
            url: '/pages/services/services?role=elderly'
          })
          break
        case 2: // 助手
          wx.navigateTo({
            url: '/pages/chat/chat?role=elderly'
          })
          break
        case 3: // 时间币
          wx.navigateTo({
            url: '/pages/wallet/wallet?role=elderly'
          })
          break
        case 4: // 我的
          wx.navigateTo({
            url: '/pages/elderly-profile/elderly-profile?role=elderly'
          })
          break
      }
    } else {
      // 家属/志愿者端导航
      switch(index) {
        case 0: // 首页
          // 当前页面，不需要跳转
          break
        case 1: // 服务
          wx.navigateTo({
            url: '/pages/services/services'
          })
          break
        case 2: // 监控
          wx.navigateTo({
            url: '/pages/monitor/monitor'
          })
          break
        case 3: // 时间币
          wx.navigateTo({
            url: '/pages/wallet/wallet'
          })
          break
        case 4: // 我的
          wx.navigateTo({
            url: '/pages/profile/profile'
          })
          break
      }
    }
  }
})