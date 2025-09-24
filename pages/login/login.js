const { authManager } = require('../../utils/auth.js')

Page({
  data: {
    phone: '',
    password: '',
    showPassword: false,
    isLoading: false,
    canLogin: false,
    phoneError: '',
    passwordError: '',
    rememberPassword: false,
    showDialog: false,
    dialogTitle: '',
    dialogContent: ''
  },
  
  onLoad() {
    console.log('登录页面加载')
    
    // 路由守卫：检查是否已登录
    if (authManager.isLoggedIn()) {
      console.log('用户已登录，跳转到主页')
      wx.redirectTo({
        url: '/pages/index/index'
      })
      return
    }
    
    // 初始化按钮状态
    this.checkCanLogin()
  },
  
  onShow() {
    console.log('登录页面显示')
    
    // 每次显示页面时也检查登录状态
    if (authManager.isLoggedIn()) {
      console.log('用户已登录，跳转到主页')
      wx.redirectTo({
        url: '/pages/index/index'
      })
    }
  },
  
  /**
   * 手机号输入
   */
  onPhoneInput(e) {
    const phone = e.detail.value
    this.setData({
      phone: phone,
      phoneError: '' // 输入时清除错误提示
    })
    this.checkCanLogin()
  },

  /**
   * 手机号失去焦点时验证
   */
  onPhoneBlur(e) {
    const phone = e.detail.value
    this.validatePhoneInput(phone)
  },
  
  /**
   * 密码输入
   */
  onPasswordInput(e) {
    const password = e.detail.value
    this.setData({
      password: password,
      passwordError: '' // 输入时清除错误提示
    })
    this.checkCanLogin()
  },

  /**
   * 密码失去焦点时验证
   */
  onPasswordBlur(e) {
    const password = e.detail.value
    this.validatePasswordInput(password)
  },
  
  /**
   * 切换密码显示
   */
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },
  
  
  /**
   * 检查登录按钮是否可用
   */
  checkCanLogin() {
    const { phone, password } = this.data
    const canLogin = phone.length === 11 && 
                     this.validatePhone(phone) &&
                     password.length >= 6
    this.setData({ canLogin })
    console.log('登录按钮状态检查:', { 
      phone: phone.length, 
      phoneValid: this.validatePhone(phone),
      password: password.length, 
      canLogin 
    })
  },
  
  /**
   * 验证手机号
   */
  validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  },

  /**
   * 实时验证手机号输入
   */
  validatePhoneInput(phone) {
    let phoneError = ''
    
    if (phone.length > 0) {
      if (phone.length < 11) {
        phoneError = '手机号长度不足11位'
      } else if (phone.length > 11) {
        phoneError = '手机号长度超过11位'
      } else if (!this.validatePhone(phone)) {
        phoneError = '手机号格式不正确'
      }
    }
    
    this.setData({ phoneError })
  },

  /**
   * 实时验证密码输入
   */
  validatePasswordInput(password) {
    let passwordError = ''
    
    if (password.length > 0 && password.length < 6) {
      passwordError = '密码至少需要6位'
    }
    
    this.setData({ passwordError })
  },
  
  /**
   * 处理登录
   */
  async handleLogin() {
    // 如果按钮不可用或正在加载，直接返回
    if (!this.data.canLogin || this.data.isLoading) {
      return
    }
    
    const { phone, password } = this.data
    
    // 验证表单
    if (!this.validatePhone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'error'
      })
      return
    }
    
    if (password.length < 6) {
      wx.showToast({
        title: '密码至少6位',
        icon: 'error'
      })
      return
    }
    
    this.setData({ isLoading: true })
    
    try {
      // 调用登录API（不需要传递角色，后端会根据用户信息返回角色）
      const result = await authManager.login({
        phone,
        password
      })
      
      if (result.success) {
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          this.redirectToMain()
        }, 1000)
      }
    } catch (error) {
      console.error('登录失败:', error)
      
      // 检查是否是网络连接失败，如果是则尝试使用测试账号
      if (error.message && error.message.includes('网络连接失败')) {
        this.tryTestAccountLogin(phone, password)
      } else {
        wx.showToast({
          title: error.message || '登录失败',
          icon: 'error'
        })
      }
    } finally {
      this.setData({ isLoading: false })
    }
  },
  
  /**
   * 尝试使用测试账号登录
   */
  tryTestAccountLogin(phone, password) {
    // 测试账号数据
    const testAccounts = {
      '13800138001': { role: 'ELDERLY', realName: '张小明' },
      '13800138002': { role: 'VOLUNTEER', realName: '李小红' },
      '13800138003': { role: 'FAMILY_MEMBER', realName: '王大华' }
    }

    // 检查是否是测试账号
    if (testAccounts[phone] && password === '123456') {
      wx.showModal({
        title: '网络连接失败',
        content: '检测到您使用的是测试账号，是否使用离线模式登录？',
        success: (res) => {
          if (res.confirm) {
            this.quickLoginTestUser(testAccounts[phone].role)
          }
        }
      })
    } else {
      wx.showModal({
        title: '网络连接失败',
        content: '无法连接到服务器，请检查网络连接或使用测试账号。是否查看测试账号信息？',
        success: (res) => {
          if (res.confirm) {
            this.showAllTestAccounts()
          }
        }
      })
    }
  },

  /**
   * 跳转到注册页面
   */
  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  },
  
  /**
   * 跳转到主页面
   */
  redirectToMain() {
    // 登录成功后直接跳转到首页，首页会根据用户角色自动显示对应界面
    wx.redirectTo({
      url: '/pages/index/index'
    })
  },

  // ========== 新增的TDesign UI事件处理方法 ==========

  /**
   * 手机号输入变化 (TDesign Input)
   */
  onPhoneChange(e) {
    const phone = e.detail.value
    this.setData({
      phone: phone,
      phoneError: ''
    })
    this.checkCanLogin()
  },

  /**
   * 密码输入变化 (TDesign Input)
   */
  onPasswordChange(e) {
    const password = e.detail.value
    this.setData({
      password: password,
      passwordError: ''
    })
    this.checkCanLogin()
  },

  /**
   * 记住密码选择变化
   */
  onRememberChange(e) {
    this.setData({
      rememberPassword: e.detail.checked
    })
  },

  /**
   * 显示忘记密码对话框
   */
  showForgotPassword() {
    this.setData({
      showDialog: true,
      dialogTitle: '忘记密码',
      dialogContent: '请联系管理员或客服人员重置密码。\n\n客服热线：400-123-4567'
    })
  },

  /**
   * 微信登录
   */
  wechatLogin() {
    this.showToast('微信登录功能开发中', 'info')
  },

  /**
   * 人脸登录
   */
  faceLogin() {
    this.showToast('人脸登录功能开发中', 'info')
  },

  /**
   * 显示用户协议
   */
  showUserAgreement() {
    this.setData({
      showDialog: true,
      dialogTitle: '用户协议',
      dialogContent: '这里是用户协议的详细内容...'
    })
  },

  /**
   * 显示隐私政策
   */
  showPrivacyPolicy() {
    this.setData({
      showDialog: true,
      dialogTitle: '隐私政策',
      dialogContent: '这里是隐私政策的详细内容...'
    })
  },

  /**
   * 显示Toast提示
   */
  showToast(message, theme = 'info') {
    this.selectComponent('#t-toast').showToast({
      theme,
      message,
      duration: 2000
    })
  },

  /**
   * 对话框确认
   */
  onDialogConfirm() {
    this.setData({
      showDialog: false
    })
  },

  /**
   * 对话框取消
   */
  onDialogCancel() {
    this.setData({
      showDialog: false
    })
  },

  // ========== 测试账号快速导入功能 ==========

  /**
   * 显示测试账号选择
   */
  showTestAccounts() {
    wx.showActionSheet({
      itemList: ['老人端测试账号 (张小明)', '志愿者端测试账号 (李小红)', '家属端测试账号 (王大华)', '查看所有测试账号'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.quickLoginTestUser('ELDERLY')
            break
          case 1:
            this.quickLoginTestUser('VOLUNTEER')
            break
          case 2:
            this.quickLoginTestUser('FAMILY_MEMBER')
            break
          case 3:
            this.showAllTestAccounts()
            break
        }
      }
    })
  },

  /**
   * 快速登录测试用户
   */
  quickLoginTestUser(role) {
    try {
      // 测试用户数据
      const testUsers = {
        'ELDERLY': {
          phone: '13800138001',
          password: '123456',
          realName: '张小明',
          role: 'ELDERLY',
          accessToken: 'test_token_elderly_001',
          userInfo: {
            userId: 1,
            phone: '13800138001',
            username: '测试用户1',
            realName: '张小明',
            role: 'ELDERLY',
            avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
            area: '大连市中山区',
            balance: 50,
            totalIncome: 0,
            totalExpense: 0
          }
        },
        'VOLUNTEER': {
          phone: '13800138002',
          password: '123456',
          realName: '李小红',
          role: 'VOLUNTEER',
          accessToken: 'test_token_volunteer_002',
          userInfo: {
            userId: 2,
            phone: '13800138002',
            username: '测试志愿者',
            realName: '李小红',
            role: 'VOLUNTEER',
            avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
            area: '大连市西岗区',
            balance: 20,
            totalIncome: 15,
            totalExpense: 5
          }
        },
        'FAMILY_MEMBER': {
          phone: '13800138003',
          password: '123456',
          realName: '王大华',
          role: 'FAMILY_MEMBER',
          accessToken: 'test_token_family_003',
          userInfo: {
            userId: 3,
            phone: '13800138003',
            username: '测试家属',
            realName: '王大华',
            role: 'FAMILY_MEMBER',
            avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
            area: '大连市沙河口区',
            balance: 30,
            totalIncome: 25,
            totalExpense: 10
          }
        }
      }

      const user = testUsers[role]
      if (!user) {
        throw new Error(`未找到角色为 ${role} 的测试用户`)
      }

      // 保存登录信息到本地存储
      wx.setStorageSync('access_token', user.accessToken)
      wx.setStorageSync('user_info', user.userInfo)
      
      wx.showToast({
        title: `已导入${user.realName}的账号`,
        icon: 'success'
      })

      // 延迟跳转到主页
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index'
        })
      }, 1500)

    } catch (error) {
      console.error('导入测试用户失败:', error)
      wx.showToast({
        title: error.message,
        icon: 'error'
      })
    }
  },

  /**
   * 显示所有测试账号信息
   */
  showAllTestAccounts() {
    const content = `测试账号信息:

1. 张小明 (老人端)
   手机号: 13800138001
   密码: 123456
   角色: ELDERLY

2. 李小红 (志愿者端)
   手机号: 13800138002
   密码: 123456
   角色: VOLUNTEER

3. 王大华 (家属端)
   手机号: 13800138003
   密码: 123456
   角色: FAMILY_MEMBER`

    wx.showModal({
      title: '测试账号信息',
      content: content,
      showCancel: false
    })
  },

  /**
   * 清除测试数据
   */
  clearTestData() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有测试数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('access_token')
          wx.removeStorageSync('user_info')
          wx.showToast({
            title: '测试数据已清除',
            icon: 'success'
          })
        }
      }
    })
  }
})






