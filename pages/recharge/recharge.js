// 时间币充值页面
Page({
  data: {
    // 用户信息
    userInfo: null,
    accountInfo: {
      balance: 0,
      totalIncome: 0,
      totalExpense: 0
    },
    monthlyUsed: 0,
    
    // 充值选项
    rechargeOptions: [
      { amount: 10, recommended: false },
      { amount: 20, recommended: true },
      { amount: 50, recommended: false },
      { amount: 100, recommended: false }
    ],
    selectedOptionIndex: 1, // 默认选择推荐选项
    
    // 页面状态
    isLoading: false
  },

  onLoad(options) {
    console.log('充值页面加载', options)
    this.loadUserInfo()
    this.loadAccountInfo()
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadAccountInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.setData({ userInfo })
        console.log('用户信息加载成功:', userInfo)
      } else {
        console.log('未找到用户信息')
        this.redirectToLogin()
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
      this.redirectToLogin()
    }
  },

  // 加载账户信息
  loadAccountInfo() {
    try {
      const accountInfo = wx.getStorageSync('accountInfo')
      if (accountInfo) {
        this.setData({ 
          accountInfo,
          monthlyUsed: accountInfo.totalExpense || 0
        })
        console.log('账户信息加载成功:', accountInfo)
      } else {
        // 使用默认数据
        const defaultAccount = {
          balance: 50,
          totalIncome: 100,
          totalExpense: 50
        }
        this.setData({ 
          accountInfo: defaultAccount,
          monthlyUsed: defaultAccount.totalExpense
        })
        wx.setStorageSync('accountInfo', defaultAccount)
      }
    } catch (error) {
      console.error('加载账户信息失败:', error)
    }
  },

  // 获取用户显示名称
  getUserDisplayName() {
    const { userInfo } = this.data
    if (userInfo && userInfo.realName) {
      return userInfo.realName
    }
    return '用户'
  },

  // 选择充值选项
  selectRecharge(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ selectedOptionIndex: index })
    console.log('选择充值选项:', this.data.rechargeOptions[index])
  },

  // 获取选中的充值金额
  getSelectedAmount() {
    const { rechargeOptions, selectedOptionIndex } = this.data
    return rechargeOptions[selectedOptionIndex].amount
  },

  // 处理充值
  processRecharge() {
    const { selectedOptionIndex, rechargeOptions, accountInfo } = this.data
    const selectedAmount = rechargeOptions[selectedOptionIndex].amount
    
    if (this.data.isLoading) return
    
    // 显示确认对话框
    wx.showModal({
      title: '确认充值',
      content: `确定要为${this.getUserDisplayName()}充值${selectedAmount}个时间币吗？`,
      success: (res) => {
        if (res.confirm) {
          this.performRecharge(selectedAmount)
        }
      }
    })
  },

  // 执行充值
  performRecharge(amount) {
    this.setData({ isLoading: true })
    
    // 模拟充值过程
    setTimeout(() => {
      try {
        // 更新账户余额
        const newBalance = this.data.accountInfo.balance + amount
        const newAccountInfo = {
          ...this.data.accountInfo,
          balance: newBalance,
          totalIncome: this.data.accountInfo.totalIncome + amount
        }
        
        // 保存到本地存储
        wx.setStorageSync('accountInfo', newAccountInfo)
        
        // 更新页面数据
        this.setData({ 
          accountInfo: newAccountInfo,
          isLoading: false
        })
        
        // 显示成功提示
        wx.showToast({
          title: `充值成功！+${amount}个时间币`,
          icon: 'success',
          duration: 2000
        })
        
        // 发送通知给老人端
        this.notifyElderly(amount)
        
        console.log('充值成功:', newAccountInfo)
        
      } catch (error) {
        console.error('充值失败:', error)
        this.setData({ isLoading: false })
        wx.showToast({
          title: '充值失败，请重试',
          icon: 'error'
        })
      }
    }, 1500)
  },

  // 通知老人端
  notifyElderly(amount) {
    // 这里可以发送消息给老人端
    console.log(`通知老人端：收到${amount}个时间币充值`)
    
    // 模拟发送通知
    wx.showModal({
      title: '充值通知',
      content: `${this.getUserDisplayName()}已收到${amount}个时间币，老人端会收到通知`,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 返回上一页
  onBackClick() {
    wx.navigateBack()
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            // 清除本地存储
            wx.removeStorageSync('userInfo')
            wx.removeStorageSync('accountInfo')
            wx.removeStorageSync('accessToken')
            
            // 跳转到登录页
            wx.reLaunch({
              url: '/pages/login/login'
            })
          } catch (error) {
            console.error('退出登录失败:', error)
          }
        }
      }
    })
  },

  // 跳转到登录页
  redirectToLogin() {
    wx.reLaunch({
      url: '/pages/login/login'
    })
  },

  // 底部导航切换
  onNavChange(e) {
    const { index } = e.detail
    const pages = [
      '/pages/index/index',
      '/pages/monitor/monitor', 
      '/pages/wallet/wallet',
      '/pages/recharge/recharge',
      '/pages/profile/profile'
    ]
    
    if (pages[index]) {
      wx.redirectTo({
        url: pages[index]
      })
    }
  }
})