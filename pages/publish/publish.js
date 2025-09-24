const auth = require('../../utils/auth.js')

Page({
  data: {
    isElderly: false,
    publishType: 'manual', // voice, manual
    serviceTypes: ['买菜代购', '家政清洁', '陪同就医', '情感陪伴', '其他服务'],
    serviceTypeIndex: 0,
    serviceDescription: '',
    serviceReward: 2,
    contactPhone: '138****5678',
    dateIndex: 0,
    timeIndex: 0,
    dateRange: [],
    timeRange: [],
    isRecording: false,
    voiceStatus: '按住开始录音',
    // 新增字段
    addressIndex: 0,
    addressOptions: ['妈妈家（幸福小区3栋2单元501）', '小区门口', '附近超市', '社区医院', '自定义地址'],
    customAddress: '',
    specialRequirements: '',
    urgencyIndex: 1,
    urgencyOptions: [
      { icon: '🟢', text: '不急', class: 'normal' },
      { icon: '🟡', text: '一般', class: 'normal' },
      { icon: '🟠', text: '较急', class: 'urgent' },
      { icon: '🔴', text: '紧急', class: 'emergency' }
    ],
    userInfo: null
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

    // 从参数中获取角色信息和发布类型
    if (options.role) {
      this.setData({
        isElderly: options.role === 'elderly'
      })
    } else {
      this.setData({
        isElderly: userInfo.role === 'elderly'
      })
    }
    
    if (options.type) {
      this.setData({
        publishType: options.type
      })
    }
    
    this.setData({
      userInfo: userInfo
    })
    
    this.initDateTimeRange()
  },

  onShow() {
    // 确保用户已登录
    if (!auth.isLoggedIn()) {
      wx.navigateTo({
        url: '../login/login'
      })
    }
  },

  initDateTimeRange() {
    // 初始化日期范围（未来7天）
    const today = new Date()
    const dateRange = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateStr = i === 0 ? '今天' : i === 1 ? '明天' : `${date.getMonth() + 1}月${date.getDate()}日`
      dateRange.push(dateStr)
    }
    
    // 初始化时间范围
    const timeRange = []
    for (let i = 8; i <= 20; i++) {
      timeRange.push(`${i}:00`)
      timeRange.push(`${i}:30`)
    }
    
    this.setData({
      dateRange: dateRange,
      timeRange: timeRange
    })
  },

  getPageTitle() {
    if (!this.data.isElderly) {
      return '代为发布'
    } else if (this.data.publishType === 'voice') {
      return '语音发布'
    } else {
      return '发布需求'
    }
  },

  getSelectedDateTime() {
    const { dateRange, timeRange, dateIndex, timeIndex } = this.data
    if (dateRange.length && timeRange.length) {
      return `${dateRange[dateIndex]} ${timeRange[timeIndex]}`
    }
    return '请选择时间'
  },

  getUserDisplayName() {
    const userInfo = this.data.userInfo
    return userInfo ? (userInfo.realName || userInfo.username || '用户') : '用户'
  },

  isFormValid() {
    const { serviceDescription, contactPhone, serviceReward, addressIndex, customAddress, addressOptions } = this.data
    return serviceDescription.trim() !== '' && 
           contactPhone.trim() !== '' && 
           serviceReward > 0 &&
           (addressIndex < addressOptions.length - 1 || customAddress.trim() !== '')
  },

  getFinalAddress() {
    const { addressIndex, customAddress, addressOptions } = this.data
    if (addressIndex === addressOptions.length - 1) {
      return customAddress
    }
    return addressOptions[addressIndex]
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

  // 表单事件处理
  onServiceTypeChange(e) {
    const index = e.detail.value
    // 根据服务类型自动设置建议报酬
    const rewards = [2, 3, 4, 2, 1] // 买菜2币，清洁3币，就医4币，陪伴2币，其他1币
    this.setData({
      serviceTypeIndex: index,
      serviceReward: rewards[index] || 2
    })
  },

  onDateTimeChange(e) {
    this.setData({
      dateIndex: e.detail.value[0],
      timeIndex: e.detail.value[1]
    })
  },

  onAddressChange(e) {
    const index = e.detail.value
    this.setData({
      addressIndex: index,
      customAddress: index !== this.data.addressOptions.length - 1 ? '' : this.data.customAddress
    })
  },

  onServiceDescriptionInput(e) {
    this.setData({
      serviceDescription: e.detail.value
    })
  },

  onServiceRewardInput(e) {
    this.setData({
      serviceReward: parseInt(e.detail.value) || 0
    })
  },

  onCustomAddressInput(e) {
    this.setData({
      customAddress: e.detail.value
    })
  },

  onSpecialRequirementsInput(e) {
    this.setData({
      specialRequirements: e.detail.value
    })
  },

  onContactPhoneInput(e) {
    this.setData({
      contactPhone: e.detail.value
    })
  },

  selectUrgency(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      urgencyIndex: index
    })
  },

  // 发布服务
  publishService() {
    // 验证表单
    if (!this.data.serviceDescription.trim()) {
      wx.showToast({
        title: '请填写服务描述',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.contactPhone.trim()) {
      wx.showToast({
        title: '请填写联系方式',
        icon: 'none'
      })
      return
    }
    
    if (this.data.serviceReward <= 0 || this.data.serviceReward > 10) {
      wx.showToast({
        title: '报酬应在1-10时间币之间',
        icon: 'none'
      })
      return
    }
    
    if (this.data.addressIndex === this.data.addressOptions.length - 1 && !this.data.customAddress.trim()) {
      wx.showToast({
        title: '请填写详细地址',
        icon: 'none'
      })
      return
    }
    
    // 构建发布数据
    const publishData = {
      type: this.data.serviceTypes[this.data.serviceTypeIndex],
      description: this.data.serviceDescription.trim(),
      time: this.getSelectedDateTime(),
      reward: this.data.serviceReward,
      address: this.getFinalAddress(),
      specialRequirements: this.data.specialRequirements.trim(),
      contact: this.data.contactPhone.trim(),
      urgency: this.data.urgencyOptions[this.data.urgencyIndex].text,
      publishTime: new Date().toLocaleString(),
      publisher: this.data.isElderly ? this.getUserDisplayName() : `${this.getUserDisplayName()}（代为发布）`
    }
    
    // 显示确认弹窗
    wx.showModal({
      title: '确认发布',
      content: `确定要发布"${publishData.type}"需求吗？\n\n时间：${publishData.time}\n报酬：${publishData.reward}时间币\n紧急程度：${publishData.urgency}`,
      confirmText: '确认发布',
      cancelText: '再检查一下',
      success: (res) => {
        if (res.confirm) {
          this.submitPublish(publishData)
        }
      }
    })
  },
  
  submitPublish(data) {
    wx.showLoading({
      title: '发布中...'
    })
    
    // 模拟发布请求
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '发布成功！',
        icon: 'success',
        success: () => {
          setTimeout(() => {
            // 显示发布结果
            wx.showModal({
              title: '发布成功',
              content: `您的"${data.type}"需求已成功发布！\n\n系统将自动为您匹配合适的志愿者，请保持手机畅通。预计很快会有志愿者联系您。`,
              confirmText: '查看订单',
              cancelText: '继续发布',
              success: (res) => {
                if (res.confirm) {
                  // 跳转到服务页面
                  wx.navigateTo({
                    url: '../services/services?role=' + (this.data.isElderly ? 'elderly' : 'family')
                  })
                } else {
                  // 重置表单
                  this.resetForm()
                }
              }
            })
          }, 1500)
        }
      })
    }, 2000)
  },
  
  resetForm() {
    this.setData({
      serviceTypeIndex: 0,
      serviceDescription: '',
      serviceReward: 2,
      addressIndex: 0,
      customAddress: '',
      specialRequirements: '',
      urgencyIndex: 1,
      dateIndex: 0,
      timeIndex: 0
    })
  },

  // 语音录制
  startRecording(e) {
    if (this.data.publishType !== 'voice') return
    
    this.setData({
      isRecording: true,
      voiceStatus: '正在录音...'
    })
    
    // 模拟录音功能
    wx.showToast({
      title: '开始录音',
      icon: 'none'
    })
  },

  stopRecording(e) {
    if (this.data.publishType !== 'voice' || !this.data.isRecording) return
    
    this.setData({
      isRecording: false,
      voiceStatus: '识别中...'
    })
    
    // 模拟语音识别
    setTimeout(() => {
      this.setData({
        voiceStatus: '识别完成'
      })
      wx.showModal({
        title: '语音识别结果',
        content: '我需要有人帮我买菜，买一些蔬菜和水果，明天上午比较方便。',
        confirmText: '确认发布',
        cancelText: '重新录音',
        success: (res) => {
          if (res.confirm) {
            this.publishService()
          } else {
            this.setData({
              voiceStatus: '按住开始录音'
            })
          }
        }
      })
    }, 2000)
  },

  quickPublish(e) {
    const type = e.currentTarget.dataset.type
    const descriptions = {
      '买菜': '需要帮忙买菜，购买一些新鲜蔬菜和水果',
      '清洁': '需要家政清洁服务，打扫房间和厨房',
      '就医': '需要陪同就医，去医院看病复查',
      '陪伴': '希望有人陪伴聊天，散步或下棋'
    }
    
    const serviceTypeIndex = this.data.serviceTypes.findIndex(item => item.includes(type))
    
    this.setData({
      serviceDescription: descriptions[type] || '',
      serviceTypeIndex: serviceTypeIndex >= 0 ? serviceTypeIndex : 0
    })
    
    wx.showToast({
      title: `已选择${type}服务`,
      icon: 'success'
    })
  },

  // 底部导航
  onNavChange(e) {
    const index = e.detail
    const routes = this.data.isElderly ? 
      ['../index/index', '../services/services', '../chat/chat', '../wallet/wallet', '../elderly-profile/elderly-profile'] :
      ['../index/index', '../services/services', '../monitor/monitor', '../wallet/wallet', '../profile/profile']
    
    if (index !== 1) { // 当前已在服务页面相关
      wx.navigateTo({
        url: routes[index] + (this.data.isElderly ? '?role=elderly' : '?role=family')
      })
    }
  }
})
