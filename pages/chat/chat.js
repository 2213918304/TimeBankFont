const { authManager } = require('../../utils/auth.js')

Page({
  data: {
    isElderly: true,
    userInfo: null,
    messages: [
      {
        type: "ai",
        content: "您好！我是您的专属AI助手小罗。我可以帮您发布服务需求、回答问题、提供健康建议。有什么需要帮助的吗？"
      }
    ],
    inputText: "",
    isTyping: false,
    isRecording: false,
    scrollTop: 0
  },
  
  onLoad(options) {
    console.log('聊天页面加载，参数:', options)
    
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
    let isElderly = true // 聊天页面主要面向老人端
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
   * 切换语音功能
   */
  toggleVoice() {
    wx.showToast({
      title: '语音功能开发中',
      icon: 'none'
    })
  },
  
  /**
   * 输入框内容变化
   */
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    })
  },
  
  /**
   * 发送消息
   */
  sendMessage() {
    const { inputText, messages, isTyping } = this.data
    
    if (!inputText.trim() || isTyping) {
      return
    }
    
    // 添加用户消息
    const userMessage = {
      type: "user",
      content: inputText.trim()
    }
    
    const newMessages = [...messages, userMessage]
    
    this.setData({
      messages: newMessages,
      inputText: "",
      isTyping: true,
      scrollTop: 999999
    })
    
    // 模拟AI回复
    setTimeout(() => {
      const aiMessage = {
        type: "ai",
        content: this.getAIResponse(inputText.trim())
      }
      
      this.setData({
        messages: [...newMessages, aiMessage],
        isTyping: false,
        scrollTop: 999999
      })
    }, 1500)
  },
  
  /**
   * 语音录音切换
   */
  toggleVoiceRecord() {
    const { isRecording } = this.data
    
    if (isRecording) {
      // 停止录音
      this.setData({
        isRecording: false
      })
      wx.showToast({
        title: '录音已停止',
        icon: 'success'
      })
    } else {
      // 开始录音
      this.setData({
        isRecording: true
      })
      wx.showToast({
        title: '开始录音...',
        icon: 'none'
      })
      
      // 模拟录音，3秒后自动停止
      setTimeout(() => {
        if (this.data.isRecording) {
          this.setData({
            isRecording: false
          })
          
          // 模拟语音转文字
          const voiceText = "您好，我需要买菜帮助"
          this.setData({
            inputText: voiceText
          })
          
          wx.showToast({
            title: '语音识别完成',
            icon: 'success'
          })
        }
      }, 3000)
    }
  },
  
  /**
   * 生成AI回复
   */
  getAIResponse(userInput) {
    const responses = {
      // 购物相关
      '买菜': '我来帮您安排买菜服务！请告诉我您需要购买什么蔬菜和水果，我会为您匹配附近的志愿者。',
      '购物': '好的，我来为您安排购物服务。您需要买什么东西呢？我可以帮您联系专业的购物志愿者。',
      
      // 医疗相关
      '看病': '我理解您需要就医帮助。我会为您安排有经验的志愿者陪同就医，确保您的安全和便利。',
      '医院': '关于就医问题，我建议您首先联系家庭医生。如需陪同服务，我可以立即为您安排。',
      
      // 清洁相关
      '打扫': '家政清洁服务我来安排！我会为您匹配专业的清洁志愿者，确保服务质量和安全。',
      '清洁': '好的，我来为您安排清洁服务。请告诉我具体需要清洁的区域，比如客厅、厨房还是卧室？',
      
      // 陪伴相关
      '聊天': '我很愿意陪您聊天！除了我这个AI助手，我也可以为您安排真人志愿者提供情感陪伴服务。',
      '孤独': '我理解您的感受。除了我随时陪伴您，我也可以安排温暖的志愿者来陪您聊天、散步。',
      
      // 健康相关
      '身体': '关于健康问题，建议您及时咨询医生。如果需要陪同就医或健康监测，我可以为您安排服务。',
      '药': '用药安全很重要。如果需要代购药品或用药提醒服务，我可以为您安排专业的志愿者。'
    }
    
    // 检查是否匹配关键词
    for (let keyword in responses) {
      if (userInput.includes(keyword)) {
        return responses[keyword]
      }
    }
    
    // 默认回复
    const defaultResponses = [
      "我理解您的需求，正在为您匹配合适的服务志愿者...",
      "根据您的描述，我建议您可以发布一个服务需求，会有专业的志愿者为您提供帮助。",
      "您可以点击下方的语音按钮详细说明您的需求，我会帮您自动整理并发布。",
      "如果是紧急情况，您可以直接拨打紧急服务电话：400-888-9999",
      "我已经为您记录了这个需求，稍后会有志愿者主动联系您。",
      "您还有其他需要帮助的地方吗？我随时为您服务。"
    ]
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  },
  
  /**
   * 底部导航切换
   */
  onNavChange(e) {
    const navIndex = e.detail
    const { isElderly } = this.data
    
    console.log('聊天页导航点击，索引:', navIndex, '是否老人端:', isElderly)
    
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
    if (navIndex === 2) {
      console.log('当前已在聊天页，不执行跳转')
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
  }
})