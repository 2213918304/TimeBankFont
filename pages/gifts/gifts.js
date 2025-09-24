const { authManager } = require('../../utils/auth.js')
const api = require('../../utils/api.js')

Page({
  data: {
    isElderly: false,
    activeCategoryIndex: 0,
    userInfo: null,
    accountInfo: {
      balance: 0,
      totalIncome: 0,
      totalExpense: 0,
      frozenAmount: 0
    },
    categories: [
      { label: '全部', value: 'all' },
      { label: '食品', value: 'food' },
      { label: '日用品', value: 'daily' },
      { label: '健康', value: 'health' }
    ],
    gifts: [
      // 食品类
      {
        id: 'rice',
        name: '优质大米 5kg',
        description: '东北优质大米，粒粒饱满香甜',
        icon: '🍚',
        price: 5,
        category: 'food'
      },
      {
        id: 'oil',
        name: '花生油 2L',
        description: '纯正花生油，香味浓郁健康',
        icon: '🫗',
        price: 4,
        category: 'food'
      },
      {
        id: 'salt',
        name: '精制食盐 500g',
        description: '海盐精制，纯净无杂质',
        icon: '🧂',
        price: 1,
        category: 'food'
      },
      {
        id: 'soy_sauce',
        name: '生抽老抽套装',
        description: '优质酱油，提鲜调色必备',
        icon: '🥢',
        price: 3,
        category: 'food'
      },
      {
        id: 'sugar',
        name: '白糖红糖套装',
        description: '烘焙调味，生活必需',
        icon: '🍯',
        price: 2,
        category: 'food'
      },
      {
        id: 'eggs',
        name: '土鸡蛋 30枚',
        description: '农家散养，营养丰富',
        icon: '🥚',
        price: 3,
        category: 'food'
      },
      {
        id: 'noodles',
        name: '挂面礼盒 2kg',
        description: '手工挂面，口感筋道',
        icon: '🍜',
        price: 2,
        category: 'food'
      },
      {
        id: 'vegetables',
        name: '时令蔬菜礼盒',
        description: '新鲜蔬菜，当日配送',
        icon: '🍎',
        price: 3,
        category: 'food'
      },
      // 日用品类
      {
        id: 'tissue',
        name: '纸巾套装',
        description: '柔软舒适，居家必备',
        icon: '🧻',
        price: 1,
        category: 'daily'
      },
      {
        id: 'detergent',
        name: '洗洁精套装',
        description: '强力去污，温和护手',
        icon: '🧴',
        price: 2,
        category: 'daily'
      },
      {
        id: 'cleaning',
        name: '清洁用品套装',
        description: '抹布、海绵、清洁刷组合',
        icon: '🧽',
        price: 1,
        category: 'daily'
      },
      // 健康类
      {
        id: 'vitamin',
        name: '维生素套装',
        description: '多种维生素，增强免疫力',
        icon: '💊',
        price: 4,
        category: 'health'
      },
      {
        id: 'tea',
        name: '养生茶礼盒',
        description: '枸杞菊花茶，清热明目',
        icon: '🍵',
        price: 3,
        category: 'health'
      }
    ],
    filteredGifts: []
  },

  onLoad(options) {
    console.log('礼品兑换页面加载，参数:', options)
    
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

    // 从参数中获取角色信息
    let isElderly = false
    if (options.role) {
      isElderly = options.role === 'elderly'
    } else {
      isElderly = userInfo.role === 'ELDERLY'
    }

    this.setData({
      userInfo: userInfo,
      isElderly: isElderly
    })

    // 加载账户信息
    this.loadAccountInfo()
    
    // 初始化筛选结果
    this.filterGifts()
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

  // 筛选礼品
  filterGifts() {
    let filtered = [...this.data.gifts]
    
    if (this.data.activeCategoryIndex > 0) {
      const selectedCategory = this.data.categories[this.data.activeCategoryIndex].value
      filtered = filtered.filter(gift => gift.category === selectedCategory)
    }
    
    this.setData({
      filteredGifts: filtered
    })
  },

  getPageTitle() {
    return this.data.isElderly ? '功能暂未开放' : '礼品兑换'
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

  // 联系家人
  callFamily() {
    wx.showModal({
      title: '联系家人',
      content: '是否要呼叫您的家人？',
      confirmText: '呼叫',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '正在呼叫家人...',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },

  // 按分类筛选
  filterByCategory(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      activeCategoryIndex: index
    }, () => {
      this.filterGifts()
    })
  },

  // 兑换礼品
  async exchangeGift(e) {
    const giftId = e.currentTarget.dataset.id
    const gift = this.data.gifts.find(g => g.id === giftId)
    const { userInfo, accountInfo } = this.data
    
    if (!gift) return

    // 检查余额是否足够
    if (gift.price > accountInfo.balance) {
      wx.showToast({
        title: '时间币余额不足',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认兑换',
      content: `确定要用${gift.price}个时间币兑换"${gift.name}"吗？\n\n兑换后余额：${accountInfo.balance - gift.price}个时间币`,
      confirmText: '确认兑换',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.executeExchange(gift)
        }
      }
    })
  },

  /**
   * 执行兑换
   */
  async executeExchange(gift) {
    const { userInfo } = this.data
    
    try {
      wx.showLoading({
        title: '兑换中...',
        mask: true
      })
      
      // 调用后端礼品兑换接口
      const response = await api.post('/gifts/exchange', {
        userId: userInfo.userId,
        giftId: gift.id
      })
      
      if (response.code === 200) {
        // 兑换成功，刷新账户信息
        await this.loadAccountInfo()
        
        wx.hideLoading()
        wx.showToast({
          title: '兑换成功！',
          icon: 'success',
          duration: 2000,
          success: () => {
            setTimeout(() => {
              wx.showModal({
                title: '兑换成功',
                content: `恭喜您！已成功兑换"${gift.name}"\n\n消耗时间币：${gift.price}个\n当前余额：${this.data.accountInfo.balance}个\n\n礼品将在1-3个工作日内配送到您的地址。`,
                confirmText: '知道了',
                showCancel: false
              })
            }, 2000)
          }
        })
      } else {
        throw new Error(response.message || '兑换失败')
      }
    } catch (error) {
      console.error('兑换失败:', error)
      wx.hideLoading()
      wx.showModal({
        title: '兑换失败',
        content: error.message || '网络异常，请稍后重试',
        confirmText: '知道了',
        showCancel: false
      })
    }
  },

  // 底部导航
  onNavChange(e) {
    const index = e.detail
    const routes = this.data.isElderly ? 
      ['../index/index', '../services/services', '../chat/chat', '../wallet/wallet', '../elderly-profile/elderly-profile'] :
      ['../index/index', '../services/services', '../monitor/monitor', '../wallet/wallet', '../profile/profile']
    
    if (index !== 3) { // 当前已在时间币相关页面
      wx.navigateTo({
        url: routes[index] + '?role=' + (this.data.isElderly ? 'elderly' : 'family')
      })
    }
  }
})

