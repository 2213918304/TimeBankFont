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
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'error'
      })
    } finally {
      this.setData({ isLoading: false })
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
  }
})






