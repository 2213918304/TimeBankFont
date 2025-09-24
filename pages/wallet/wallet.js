const { authManager } = require('../../utils/auth.js')
const api = require('../../utils/api.js')

Page({
  data: {
    isElderly: false,
    userInfo: null,
    // 时间币账户信息
    accountInfo: {
      balance: 0,
      totalIncome: 0,
      totalExpense: 0,
      frozenAmount: 0
    },
    // 交易记录
    transactions: [],
    transactionPage: 0,
    hasMoreTransactions: true,
    loadingTransactions: false,
    // 统计信息
    stats: {
      thisMonthIncome: 0,
      thisMonthExpense: 0,
      totalTransactions: 0
    }
  },
  
  onLoad(options) {
    console.log('钱包页面加载，参数:', options)
    
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
    
    // 加载时间币数据
    this.loadTimeCoinData()
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
    
    // 初始化完成后加载数据
    this.loadTimeCoinData()
  },

  /**
   * 加载时间币数据
   */
  async loadTimeCoinData() {
    const { userInfo } = this.data
    if (!userInfo || !userInfo.userId) {
      console.error('用户信息不完整')
      return
    }

    try {
      wx.showLoading({ title: '加载中...' })
      
      // 并行加载账户信息和交易记录
      await Promise.all([
        this.loadAccountInfo(),
        this.loadTransactionHistory(true)
      ])
      
    } catch (error) {
      console.error('加载时间币数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 加载账户信息
   */
  async loadAccountInfo() {
    const { userInfo } = this.data
    
    try {
      const response = await api.get(`/timecoin/account/${userInfo.userId}`)
      
      if (response.code === 200) {
        this.setData({
          accountInfo: {
            balance: response.data.balance || 0,
            totalIncome: response.data.totalIncome || 0,
            totalExpense: response.data.totalExpense || 0,
            frozenAmount: response.data.frozenAmount || 0
          }
        })
        
        // 同时加载统计信息
        await this.loadUserStats()
      }
    } catch (error) {
      console.error('加载账户信息失败:', error)
      
      // 如果账户不存在，尝试创建
      if (error.message && error.message.includes('账户不存在')) {
        await this.createAccount()
      }
    }
  },

  /**
   * 加载用户统计信息
   */
  async loadUserStats() {
    const { userInfo } = this.data
    
    try {
      const response = await api.get(`/timecoin/stats/${userInfo.userId}`)
      
      if (response.code === 200) {
        this.setData({
          'stats.totalTransactions': response.data.transactionCount || 0
        })
      }
    } catch (error) {
      console.error('加载统计信息失败:', error)
    }
  },

  /**
   * 创建账户
   */
  async createAccount() {
    const { userInfo } = this.data
    
    try {
      const response = await api.post('/timecoin/account', { userId: userInfo.userId })
      
      if (response.code === 200) {
        console.log('账户创建成功')
        this.setData({
          accountInfo: {
            balance: 0,
            totalIncome: 0,
            totalExpense: 0,
            frozenAmount: 0
          }
        })
      }
    } catch (error) {
      console.error('创建账户失败:', error)
    }
  },

  /**
   * 加载交易记录
   */
  async loadTransactionHistory(reset = false) {
    const { userInfo, transactionPage, loadingTransactions } = this.data
    
    if (loadingTransactions) return
    
    this.setData({ loadingTransactions: true })
    
    try {
      const page = reset ? 0 : transactionPage
      const response = await api.get(`/timecoin/transactions/${userInfo.userId}`, {
        page: page,
        size: 20
      })
      
      if (response.code === 200) {
        const newTransactions = response.data.content || []
        
        this.setData({
          transactions: reset ? newTransactions : [...this.data.transactions, ...newTransactions],
          transactionPage: page + 1,
          hasMoreTransactions: !response.data.last,
          'stats.totalTransactions': response.data.totalElements || 0
        })
      }
    } catch (error) {
      console.error('加载交易记录失败:', error)
    } finally {
      this.setData({ loadingTransactions: false })
    }
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    try {
      await this.loadTimeCoinData()
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMoreTransactions && !this.data.loadingTransactions) {
      this.loadTransactionHistory(false)
    }
  },

  /**
   * 加载更多交易记录
   */
  loadMoreTransactions() {
    if (this.data.hasMoreTransactions && !this.data.loadingTransactions) {
      this.loadTransactionHistory(false)
    }
  },

  /**
   * 获取交易图标
   */
  getTransactionIcon(businessType) {
    const iconMap = {
      'OFFICIAL_RECHARGE': '💰',
      'TASK_REWARD': '🎁',
      'TASK_PAYMENT': '🛒',
      'GIFT_EXCHANGE': '🎁',
      'ACTIVITY_REWARD': '🏆',
      'SYSTEM_ADJUSTMENT': '⚙️',
      'REFUND': '↩️'
    }
    return iconMap[businessType] || '💳'
  },

  /**
   * 获取业务类型描述
   */
  getBusinessTypeDesc(businessType) {
    const descMap = {
      'OFFICIAL_RECHARGE': '官方充值',
      'TASK_REWARD': '任务奖励',
      'TASK_PAYMENT': '任务支付',
      'GIFT_EXCHANGE': '礼品兑换',
      'ACTIVITY_REWARD': '活动奖励',
      'SYSTEM_ADJUSTMENT': '系统调整',
      'REFUND': '退款'
    }
    return descMap[businessType] || '未知交易'
  },

  /**
   * 格式化时间
   */
  formatTime(timeStr) {
    if (!timeStr) return ''
    
    const time = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - time.getTime()
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    
    if (days === 0) {
      const hours = Math.floor(diff / (60 * 60 * 1000))
      if (hours === 0) {
        const minutes = Math.floor(diff / (60 * 1000))
        return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
      }
      return `${hours}小时前`
    } else if (days === 1) {
      return '昨天'
    } else if (days === 2) {
      return '前天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return time.toLocaleDateString()
    }
  },
  
  /**
   * 返回上一页
   */
  goBack() {
    // 获取页面栈
    const pages = getCurrentPages()
    
    if (pages.length > 1) {
      // 有上一页，正常返回
      wx.navigateBack({
        delta: 1
      })
    } else {
      // 没有上一页，跳转到首页
      wx.reLaunch({
        url: '/pages/index/index'
      })
    }
  },
  
  /**
   * 底部导航切换
   */
  onNavChange(e) {
    const navIndex = e.detail
    const { isElderly } = this.data
    
    console.log('钱包页导航点击，索引:', navIndex, '是否老人端:', isElderly)
    
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
    if (navIndex === 3) {
      console.log('当前已在钱包页，不执行跳转')
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
   * 跳转到充值页面
   */
  goToRecharge() {
    const { isElderly } = this.data
    
    if (isElderly) {
      // 老人端跳转到专门的老人充值页面
      wx.navigateTo({
        url: '/pages/elderly-recharge/elderly-recharge'
      }).catch(err => {
        console.error('跳转失败:', err)
        wx.showToast({
          title: '页面开发中',
          icon: 'none'
        })
      })
    } else {
      // 家属端跳转到原充值页面
      wx.navigateTo({
        url: '/pages/recharge/recharge?role=family'
      }).catch(err => {
        console.error('跳转失败:', err)
        wx.showToast({
          title: '页面开发中',
          icon: 'none'
        })
      })
    }
  },
  
  /**
   * 跳转到礼品兑换
   */
  goToGifts() {
    const { isElderly } = this.data
    
    // 礼品兑换功能仅对家属端开放
    if (isElderly) {
      wx.showToast({
        title: '礼品兑换功能暂未开放',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/gifts/gifts?role=family'
    }).catch(err => {
      console.error('跳转失败:', err)
      wx.showToast({
        title: '页面开发中',
        icon: 'none'
      })
    })
  },
  
  /**
   * 显示交易记录
   */
  showTransactionHistory() {
    wx.showModal({
      title: '交易记录',
      content: '这里显示详细的交易记录，包括充值、消费、兑换等所有记录。',
      confirmText: '知道了',
      showCancel: false
    })
  },
  
  /**
   * 请家人充值 (老人端)
   */
  requestRecharge() {
    wx.showModal({
      title: '请家人充值',
      content: '您可以通过以下方式请家人为您充值时间币：\n\n1. 直接拨打电话\n2. 发送微信消息\n3. 显示充值二维码',
      confirmText: '拨打电话',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.callFamily()
        }
      }
    })
  },
  
  /**
   * 联系家人
   */
  callFamily() {
    wx.showActionSheet({
      itemList: ['拨打 13800138000 (罗泽)', '发送微信消息', '显示充值二维码'],
      success: (res) => {
        switch(res.tapIndex) {
          case 0:
            wx.makePhoneCall({
              phoneNumber: '13800138000'
            }).catch(err => {
              console.error('拨打电话失败:', err)
              wx.showToast({
                title: '拨打电话失败',
                icon: 'none'
              })
            })
            break
          case 1:
            wx.showToast({
              title: '微信消息发送成功',
              icon: 'success'
            })
            break
          case 2:
            this.showRechargeQR()
            break
        }
      }
    })
  },
  
  /**
   * 显示充值二维码
   */
  showRechargeQR() {
    wx.showModal({
      title: '充值二维码',
      content: '请让家人扫描此二维码为您充值\n\n[这里显示二维码图片]\n\n充值码：TB20241221001',
      confirmText: '知道了',
      showCancel: false
    })
  },
  
  /**
   * 显示获得时间币的方法
   */
  showEarnTips() {
    wx.showModal({
      title: '如何获得时间币',
      content: '您可以通过以下方式获得时间币：\n\n💪 完成简单任务\n📱 每日签到\n👨‍👩‍👧‍👦 邀请朋友注册\n⭐ 给志愿者好评\n🎯 参与社区活动',
      confirmText: '我知道了',
      cancelText: '查看任务',
      success: (res) => {
        if (res.cancel) {
          // 跳转到任务页面（暂未实现）
          wx.showToast({
            title: '任务功能开发中',
            icon: 'none'
          })
        }
      }
    })
  },
  
  /**
   * 显示支付教程
   */
  showPaymentGuide() {
    wx.showModal({
      title: '💳 微信支付教程',
      content: '老人自助充值简单步骤：\n\n1️⃣ 点击"立即充值"按钮\n2️⃣ 选择充值金额\n3️⃣ 点击"微信支付"\n4️⃣ 输入微信支付密码\n5️⃣ 充值成功，时间币到账\n\n💡 如果支付遇到困难，可以：\n• 请家人代为充值\n• 拨打客服电话：400-888-8888',
      confirmText: '我明白了',
      cancelText: '联系客服',
      success: (res) => {
        if (res.cancel) {
          wx.makePhoneCall({
            phoneNumber: '400-888-8888'
          }).catch(err => {
            console.error('拨打客服电话失败:', err)
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