const auth = require('../../utils/auth.js')

Page({
  data: {
    activeTypeIndex: 0,
    distanceIndex: 0,
    rewardIndex: 0,
    showDetailModal: false,
    selectedOrder: {},
    userInfo: null,
    serviceTypes: [
      { label: '全部', value: 'all' },
      { label: '买菜代购', value: '买菜' },
      { label: '家政清洁', value: '清洁' },
      { label: '陪同就医', value: '就医' },
      { label: '情感陪伴', value: '陪伴' }
    ],
    distanceOptions: ['所有距离', '1km以内', '3km以内', '5km以内'],
    rewardOptions: ['所有报酬', '1时间币', '2时间币', '3时间币', '4时间币及以上'],
    orders: [
      {
        id: 'order1',
        title: '买菜代购服务',
        elder: '张奶奶',
        distance: 1.2,
        time: '今天下午 14:00-17:00',
        reward: 2,
        type: '买菜',
        description: '需要购买蔬菜、水果和日用品。购物地点：小区门口永辉超市。',
        tags: [
          { text: '步行可达', type: 'blue' },
          { text: '约1小时', type: 'blue' },
          { text: '新手友好', type: 'green' }
        ],
        duration: '约1小时',
        age: '75岁',
        health: '良好',
        requirements: '购买新鲜蔬菜，避免选择太贵的商品',
        address: '幸福小区3栋2单元501',
        contact: '张奶奶',
        phone: '138****1234'
      },
      {
        id: 'order2',
        title: '家政清洁服务',
        elder: '李爷爷',
        distance: 2.5,
        time: '明天上午 9:00-12:00',
        reward: 3,
        type: '清洁',
        description: '需要打扫客厅、厨房和卫生间。家里有清洁用品，约需2-3小时。',
        tags: [
          { text: '用品齐全', type: 'blue' },
          { text: '2-3小时', type: 'blue' },
          { text: '需经验', type: 'yellow' }
        ],
        duration: '2-3小时',
        age: '82岁',
        health: '一般',
        requirements: '注意不要移动贵重物品，清洁用品已准备',
        address: '康乐小区5栋1单元302',
        contact: '李爷爷',
        phone: '138****5678'
      },
      {
        id: 'order3',
        title: '陪同就医服务',
        elder: '王奶奶',
        distance: 0.8,
        time: '明天下午 14:00-17:00',
        reward: 4,
        type: '就医',
        description: '陪同到社区医院复查，需要排队取号、陪同检查。预计3小时。',
        tags: [
          { text: '就近医院', type: 'blue' },
          { text: '约3小时', type: 'blue' },
          { text: '高报酬', type: 'red' }
        ],
        duration: '约3小时',
        age: '78岁',
        health: '有高血压',
        requirements: '需要有耐心，协助排队和记录医生建议',
        address: '阳光花园2栋3单元101',
        contact: '王奶奶',
        phone: '138****9012'
      },
      {
        id: 'order4',
        title: '情感陪伴服务',
        elder: '陈爷爷',
        distance: 1.8,
        time: '后天上午 10:00-12:00',
        reward: 2,
        type: '陪伴',
        description: '希望有人陪伴聊天、下棋或散步。老人比较健谈，喜欢分享生活经历。',
        tags: [
          { text: '轻松愉快', type: 'green' },
          { text: '2小时', type: 'blue' },
          { text: '健谈老人', type: 'green' }
        ],
        duration: '2小时',
        age: '73岁',
        health: '很好',
        requirements: '喜欢下象棋，对历史比较感兴趣',
        address: '和谐家园6栋2单元202',
        contact: '陈爷爷',
        phone: '138****3456'
      },
      {
        id: 'order5',
        title: '买菜代购服务',
        elder: '刘奶奶',
        distance: 3.2,
        time: '今天晚上 17:00-19:00',
        reward: 3,
        type: '买菜',
        description: '需要购买晚餐食材，包括肉类、蔬菜。购物地点：华润万家超市。',
        tags: [
          { text: '大型超市', type: 'blue' },
          { text: '约1.5小时', type: 'blue' },
          { text: '购物清单', type: 'green' }
        ],
        duration: '约1.5小时',
        age: '69岁',
        health: '良好',
        requirements: '有详细购物清单，按清单购买即可',
        address: '绿城小区8栋1单元405',
        contact: '刘奶奶',
        phone: '138****7890'
      }
    ],
    filteredOrders: []
  },

  onLoad(options) {
    // 获取用户信息
    const userInfo = auth.getUserInfo()
    if (!userInfo) {
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }

    this.setData({
      userInfo: userInfo
    })

    // 初始化筛选结果
    this.filterOrders()
  },

  onShow() {
    // 确保用户已登录
    if (!auth.isLoggedIn()) {
      wx.navigateTo({
        url: '../login/login'
      })
    }
  },

  // 筛选订单
  filterOrders() {
    let filtered = [...this.data.orders]
    
    // 按服务类型筛选
    if (this.data.activeTypeIndex > 0) {
      const selectedType = this.data.serviceTypes[this.data.activeTypeIndex].value
      filtered = filtered.filter(order => order.type === selectedType)
    }
    
    // 按距离筛选
    if (this.data.distanceIndex > 0) {
      const maxDistance = [0, 1, 3, 5][this.data.distanceIndex]
      filtered = filtered.filter(order => order.distance <= maxDistance)
    }
    
    // 按报酬筛选
    if (this.data.rewardIndex > 0) {
      if (this.data.rewardIndex === 4) {
        // 4时间币及以上
        filtered = filtered.filter(order => order.reward >= 4)
      } else {
        // 具体时间币数量
        filtered = filtered.filter(order => order.reward === this.data.rewardIndex)
      }
    }
    
    this.setData({
      filteredOrders: filtered
    })
  },

  // 返回按钮
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
          auth.logout()
          wx.reLaunch({
            url: '../login/login'
          })
        }
      }
    })
  },

  // 刷新订单
  refreshOrders() {
    wx.showLoading({
      title: '刷新中...'
    })
    
    // 模拟刷新
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '刷新完成',
        icon: 'success'
      })
    }, 1500)
  },

  // 按类型筛选
  filterByType(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      activeTypeIndex: index
    }, () => {
      this.filterOrders()
    })
  },

  // 距离筛选改变
  onDistanceChange(e) {
    this.setData({
      distanceIndex: e.detail.value
    }, () => {
      this.filterOrders()
    })
  },

  // 报酬筛选改变
  onRewardChange(e) {
    this.setData({
      rewardIndex: e.detail.value
    }, () => {
      this.filterOrders()
    })
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    const order = this.data.orders.find(o => o.id === orderId)
    if (order) {
      this.setData({
        selectedOrder: order,
        showDetailModal: true
      })
    }
  },

  // 关闭详情弹窗
  closeDetailModal() {
    this.setData({
      showDetailModal: false,
      selectedOrder: {}
    })
  },

  // 从详情页接单
  acceptOrderFromDetail() {
    this.acceptOrder()
    this.closeDetailModal()
  },

  // 查看地图
  viewMap() {
    wx.showToast({
      title: '地图功能开发中',
      icon: 'none'
    })
  },

  // 拨打电话
  makeCall() {
    const phone = this.data.selectedOrder.phone || '138****8888'
    wx.showModal({
      title: '拨打电话',
      content: `确定要拨打 ${phone} 吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: phone.replace(/\*/g, '1') // 模拟真实号码
          })
        }
      }
    })
  },

  // 接单
  acceptOrder(e) {
    let order
    if (e) {
      // 从列表接单
      const orderId = e.currentTarget.dataset.id
      order = this.data.orders.find(o => o.id === orderId)
    } else {
      // 从详情页接单
      order = this.data.selectedOrder
    }

    if (!order) return

    wx.showModal({
      title: '确认接单',
      content: `确定要接取"${order.title}"订单吗？\n\n服务对象：${order.elder}\n报酬：${order.reward}时间币\n时间：${order.time}`,
      confirmText: '确认接单',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '接单中...'
          })
          
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({
              title: '接单成功！',
              icon: 'success',
              success: () => {
                setTimeout(() => {
                  // 接单成功后跳转到服务页面
                  wx.navigateTo({
                    url: '../services/services?role=family'
                  })
                }, 1500)
              }
            })
          }, 2000)
        }
      }
    })
  },

  // 底部导航
  onNavChange(e) {
    const index = e.detail
    const routes = ['../index/index', '../services/services', '../monitor/monitor', '../wallet/wallet', '../profile/profile']
    
    if (index !== 1) { // 当前已在服务相关页面
      wx.navigateTo({
        url: routes[index] + '?role=family'
      })
    }
  }
})

