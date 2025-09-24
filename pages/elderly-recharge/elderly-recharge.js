const { authManager } = require('../../utils/auth.js')
const api = require('../../utils/api.js')

Page({
  data: {
    selectedIndex: 1, // 默认选择第二个(10个时间币)
    userInfo: null,
    accountInfo: {
      balance: 0,
      totalIncome: 0,
      totalExpense: 0,
      frozenAmount: 0
    },
    rechargeAmounts: [
      { coins: 5, popular: false },
      { coins: 10, popular: true },
      { coins: 20, popular: false },
      { coins: 30, popular: false }
    ]
  },

  onLoad(options) {
    console.log('老人端充值页面加载，参数:', options)
    
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
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }

    this.setData({
      userInfo: userInfo
    })

    // 加载账户信息
    this.loadAccountInfo()
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
   * 加载账户信息
   */
  async loadAccountInfo() {
    const { userInfo } = this.data
    
    try {
      wx.showLoading({ title: '加载中...' })
      
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
      }
    } catch (error) {
      console.error('加载账户信息失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  getSelectedAmount() {
    return this.data.rechargeAmounts[this.data.selectedIndex].coins
  },

  getUserDisplayName() {
    const userInfo = this.data.userInfo
    return userInfo ? (userInfo.realName || userInfo.username || '用户') : '用户'
  },

  // 返回按钮
  onBackClick() {
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

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          auth.logout()
          wx.reLaunch({
            url: '../login/login'
          })
        }
      }
    })
  },

  // 显示帮助
  showHelp() {
    wx.showModal({
      title: '💡 充值帮助',
      content: '时间币充值说明：\n\n1️⃣ 选择要充值的数量\n2️⃣ 确认充值金额\n3️⃣ 微信支付完成\n4️⃣ 时间币立即到账\n\n💰 充值后可以购买：\n• 买菜代购服务\n• 家政清洁服务\n• 陪同就医服务\n• 情感陪伴服务',
      confirmText: '我明白了',
      showCancel: false
    })
  },

  // 选择充值金额
  selectAmount(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      selectedIndex: index
    })
  },

  // 确认充值
  confirmRecharge() {
    const amount = this.getSelectedAmount()
    
    wx.showModal({
      title: '确认充值',
      content: `您要充值 ${amount} 个时间币\n\n充值后可以享受更多社区服务\n\n确定要继续吗？`,
      confirmText: '确定充值',
      cancelText: '再想想',
      confirmColor: '#FF7043',
      success: (res) => {
        if (res.confirm) {
          this.processPayment()
        }
      }
    })
  },

  // 处理支付
  processPayment() {
    const amount = this.getSelectedAmount()
    
    wx.showModal({
      title: '💳 微信支付',
      content: `即将使用微信支付充值 ${amount} 个时间币\n\n请确保您的微信有足够余额\n\n准备好了吗？`,
      confirmText: '开始支付',
      cancelText: '取消',
      confirmColor: '#FF7043',
      success: (res) => {
        if (res.confirm) {
          this.startPayment(amount)
        }
      }
    })
  },

  // 开始支付
  async startPayment(amount) {
    const { userInfo } = this.data
    
    try {
      wx.showLoading({
        title: '正在支付...',
        mask: true
      })
      
      // 调用后端充值接口
      const response = await api.post('/timecoin/recharge', {
        userId: userInfo.userId,
        amount: amount,
        description: `老人端自助充值${amount}个时间币`
      })
      
      if (response.code === 200) {
        // 充值成功，刷新账户信息
        await this.loadAccountInfo()
        
        wx.hideLoading()
        // 支付成功
        wx.showToast({
          title: '支付成功！',
          icon: 'success',
          duration: 2000,
          success: () => {
            setTimeout(() => {
              this.showSuccessResult(amount)
            }, 2000)
          }
        })
      } else {
        throw new Error(response.message || '充值失败')
      }
    } catch (error) {
      console.error('充值失败:', error)
      wx.hideLoading()
      wx.showModal({
        title: '充值失败',
        content: error.message || '网络异常，请稍后重试',
        confirmText: '知道了',
        showCancel: false,
        confirmColor: '#FF7043'
      })
    }
  },

  // 显示成功结果
  showSuccessResult(amount) {
    const { accountInfo } = this.data
    wx.showModal({
      title: '🎉 充值成功',
      content: `恭喜您！充值成功\n\n💰 充值数量：${amount} 个时间币\n💰 当前余额：${accountInfo.balance} 个时间币\n\n🎯 现在可以享受更多社区服务了！`,
      confirmText: '我知道了',
      showCancel: false,
      confirmColor: '#FF7043',
      success: () => {
        // 返回时间币页面
        const pages = getCurrentPages()
        if (pages.length > 1) {
          wx.navigateBack()
        } else {
          wx.reLaunch({
            url: '/pages/index/index'
          })
        }
      }
    })
  },

  // 显示支付教程
  showPaymentGuide() {
    wx.showModal({
      title: '💳 微信支付教程',
      content: '简单4步完成支付：\n\n1️⃣ 点击"开始支付"按钮\n2️⃣ 系统跳转到微信支付\n3️⃣ 输入微信支付密码\n4️⃣ 支付完成，时间币到账\n\n🔒 微信支付很安全：\n• 银行级别安全保护\n• 只需要支付密码\n• 支付记录可查询',
      confirmText: '我学会了',
      cancelText: '再看看',
      confirmColor: '#FF7043'
    })
  },

  // 联系客服
  callService() {
    wx.showModal({
      title: '📞 联系客服',
      content: '客服热线：400-888-8888\n\n服务时间：\n周一至周日 8:00-22:00\n\n客服可以帮您：\n• 指导支付操作\n• 解答充值问题\n• 协助完成充值',
      confirmText: '拨打电话',
      cancelText: '稍后再说',
      confirmColor: '#FF7043',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '400-888-8888'
          })
        }
      }
    })
  }
})