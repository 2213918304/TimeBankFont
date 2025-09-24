const { authManager } = require('../../utils/auth.js')

Page({
  data: {
    // 步骤控制
    currentStep: 0,
    canProceed: false,
    isLoading: false,
    
    // 基本信息
    selectedArea: '',
    realName: '',
    password: '',
    idCard: '',
    gender: '',
    avatarFiles: [],
    
    // 志愿者信息
    volunteerSkills: [],
    qualificationFiles: [],
    volunteerType: '',
    profession: '',
    serviceRange: 'street',
    
    // 身份选择
    selectedRole: '',
    
    // UI控制
    showPassword: false,
    showDialog: false,
    dialogTitle: '',
    dialogContent: '',
    
    // 原有字段（兼容性）
    phone: '',
    username: '',
    agreeTerms: false
  },
  
  onLoad() {
    console.log('注册页面加载')
    
    // 路由守卫：检查是否已登录
    if (authManager.isLoggedIn()) {
      console.log('用户已登录，跳转到主页')
      wx.redirectTo({
        url: '/pages/index/index'
      })
      return
    }
    
    // 初始化按钮状态
    this.checkCanRegister()
    this.checkStepCanProceed()
  },
  
  onShow() {
    console.log('注册页面显示')
    
    // 每次显示页面时也检查登录状态
    if (authManager.isLoggedIn()) {
      console.log('用户已登录，跳转到主页')
      wx.redirectTo({
        url: '/pages/index/index'
      })
    }
  },
  
  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack()
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
    this.checkCanRegister()
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
    // 重新验证确认密码（因为密码改变了）
    if (this.data.confirmPassword) {
      this.validateConfirmPasswordInput(this.data.confirmPassword, password)
    }
    this.checkCanRegister()
  },

  /**
   * 密码失去焦点时验证
   */
  onPasswordBlur(e) {
    const password = e.detail.value
    this.validatePasswordInput(password)
    // 重新验证确认密码
    if (this.data.confirmPassword) {
      this.validateConfirmPasswordInput(this.data.confirmPassword, password)
    }
  },
  
  /**
   * 确认密码输入
   */
  onConfirmPasswordInput(e) {
    const confirmPassword = e.detail.value
    this.setData({
      confirmPassword: confirmPassword,
      confirmPasswordError: '' // 输入时清除错误提示
    })
    this.checkCanRegister()
  },

  /**
   * 确认密码失去焦点时验证
   */
  onConfirmPasswordBlur(e) {
    const confirmPassword = e.detail.value
    this.validateConfirmPasswordInput(confirmPassword, this.data.password)
  },
  
  /**
   * 用户名输入
   */
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    })
  },
  
  /**
   * 真实姓名输入
   */
  onRealNameInput(e) {
    this.setData({
      realName: e.detail.value
    })
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
   * 切换确认密码显示
   */
  toggleConfirmPassword() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    })
  },
  
  /**
   * 选择角色
   */
  selectRole(e) {
    const role = e.currentTarget.dataset.role
    this.setData({
      selectedRole: role
    })
    this.checkCanRegister()
  },
  
  /**
   * 同意协议
   */
  onAgreeChange(e) {
    const checked = e.detail.value.length > 0
    console.log('协议勾选状态变化:', e.detail.value, '-> checked:', checked)
    this.setData({
      agreeTerms: checked
    })
    this.checkCanRegister()
  },
  
  /**
   * 检查注册按钮是否可用
   */
  checkCanRegister() {
    const { phone, password, confirmPassword, selectedRole } = this.data
    
    // 详细检查每个条件（暂时跳过用户协议检查）
    const phoneLength = phone.length === 11
    const phoneValid = phone.length === 11 ? this.validatePhone(phone) : false
    const passwordLength = password.length >= 6
    const passwordMatch = password === confirmPassword && password.length > 0
    const roleSelected = !!selectedRole
    
    const canRegister = phoneLength && 
                        phoneValid &&
                        passwordLength && 
                        passwordMatch &&
                        roleSelected
                        // 暂时不检查 termsAgreed
                        
    this.setData({ canRegister })
    console.log('注册按钮状态检查:', { 
      phone: `${phone} (${phone.length}位)`,
      phoneLength: phoneLength ? '✅' : '❌',
      phoneValid: phoneValid ? '✅' : '❌',
      passwordLength: passwordLength ? '✅' : '❌',
      passwordMatch: passwordMatch ? '✅' : '❌',
      roleSelected: roleSelected ? '✅' : '❌',
      canRegister: canRegister ? '✅ 可注册' : '❌ 不可注册',
      note: '暂时跳过用户协议检查'
    })
  },
  
  /**
   * 显示用户协议
   */
  showTerms() {
    wx.showModal({
      title: '用户协议',
      content: '这里是用户协议的详细内容...',
      showCancel: false
    })
  },
  
  /**
   * 显示隐私政策
   */
  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '这里是隐私政策的详细内容...',
      showCancel: false
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
    
    if (password.length > 0) {
      if (password.length < 6) {
        passwordError = '密码至少需要6位'
      } else if (password.length > 20) {
        passwordError = '密码不能超过20位'
      } else if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(password)) {
        passwordError = '密码只能包含字母、数字和常用符号'
      }
    }
    
    this.setData({ passwordError })
  },

  /**
   * 实时验证确认密码输入
   */
  validateConfirmPasswordInput(confirmPassword, password) {
    let confirmPasswordError = ''
    
    if (confirmPassword.length > 0) {
      if (confirmPassword !== password) {
        confirmPasswordError = '两次密码输入不一致'
      }
    }
    
    this.setData({ confirmPasswordError })
  },
  
  /**
   * 验证表单
   */
  validateForm() {
    const { phone, password, confirmPassword, selectedRole, agreeTerms } = this.data
    
    if (!this.validatePhone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'error'
      })
      return false
    }
    
    if (password.length < 6) {
      wx.showToast({
        title: '密码至少6位',
        icon: 'error'
      })
      return false
    }
    
    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码输入不一致',
        icon: 'error'
      })
      return false
    }
    
    if (!selectedRole) {
      wx.showToast({
        title: '请选择身份',
        icon: 'error'
      })
      return false
    }
    
    // 暂时跳过用户协议检查
    // if (!agreeTerms) {
    //   wx.showToast({
    //     title: '请同意用户协议',
    //     icon: 'error'
    //   })
    //   return false
    // }
    
    return true
  },
  
  /**
   * 处理注册
   */
  async handleRegister() {
    // 如果按钮不可用或正在加载，直接返回
    if (!this.data.canRegister || this.data.isLoading) {
      return
    }
    
    if (!this.validateForm()) {
      return
    }
    
    const { phone, password, username, realName, selectedRole } = this.data
    
    this.setData({ isLoading: true })
    
    try {
      // 调用注册API
      const result = await authManager.register({
        phone,
        password,
        username: username || undefined,
        realName: realName || undefined,
        role: selectedRole
      })
      
      if (result.success) {
        wx.showToast({
          title: '注册成功',
          icon: 'success'
        })
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/index/index'
          })
        }, 1000)
      }
    } catch (error) {
      console.error('注册失败:', error)
      wx.showToast({
        title: error.message || '注册失败',
        icon: 'error'
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },
  
  /**
   * 跳转到登录页面
   */
  goToLogin() {
    wx.navigateBack()
  },

  // ========== 新增的TDesign UI事件处理方法 ==========

  /**
   * 姓名输入变化
   */
  onRealNameChange(e) {
    this.setData({
      realName: e.detail.value
    })
    this.checkStepCanProceed()
  },

  /**
   * 密码输入变化
   */
  onPasswordChange(e) {
    this.setData({
      password: e.detail.value
    })
    this.checkStepCanProceed()
  },

  /**
   * 身份证输入变化
   */
  onIdCardChange(e) {
    this.setData({
      idCard: e.detail.value
    })
    this.checkStepCanProceed()
  },

  /**
   * 性别选择变化
   */
  onGenderChange(e) {
    this.setData({
      gender: e.detail.value
    })
    this.checkStepCanProceed()
  },

  /**
   * 选择地区
   */
  selectArea() {
    console.log('selectArea 函数被调用')
    // 由于actionSheet限制6个选项，将大连区域分为两组
    const areas = ['大连市中山区', '大连市西岗区', '大连市沙河口区', '大连市甘井子区', '大连市旅顺口区', '更多区域...']
    const moreAreas = ['大连市金州区', '大连市普兰店区', '大连市瓦房店市', '大连市庄河市', '大连市长海县']
    
    // 先显示前5个区域 + "更多区域"选项
    wx.showActionSheet({
      itemList: areas,
      success: (res) => {
        if (res.tapIndex < 5) {
          // 选择了前5个区域之一
          this.setData({
            selectedArea: areas[res.tapIndex]
          })
          this.checkStepCanProceed()
          console.log('用户选择了地区:', areas[res.tapIndex])
        } else {
          // 选择了"更多区域"，显示剩余的区域
          wx.showActionSheet({
            itemList: moreAreas,
            success: (res2) => {
              this.setData({
                selectedArea: moreAreas[res2.tapIndex]
              })
              this.checkStepCanProceed()
              console.log('用户选择了地区:', moreAreas[res2.tapIndex])
            },
            fail: (err2) => {
              console.error('更多地区选择失败:', err2)
            }
          })
        }
      },
      fail: (err) => {
        console.error('地区选择失败:', err)
      }
    })
  },


  /**
   * 头像上传成功
   */
  onAvatarUpload(e) {
    this.setData({
      avatarFiles: e.detail.files
    })
    this.checkStepCanProceed()
  },

  /**
   * 头像移除
   */
  onAvatarRemove(e) {
    this.setData({
      avatarFiles: []
    })
    this.checkStepCanProceed()
  },

  /**
   * 志愿者技能选择变化
   */
  onSkillsChange(e) {
    this.setData({
      volunteerSkills: e.detail.value
    })
    this.checkStepCanProceed()
  },

  /**
   * 资质文件上传成功
   */
  onQualificationUpload(e) {
    this.setData({
      qualificationFiles: e.detail.files
    })
  },

  /**
   * 资质文件移除
   */
  onQualificationRemove(e) {
    const files = this.data.qualificationFiles.filter((_, index) => index !== e.detail.index)
    this.setData({
      qualificationFiles: files
    })
  },

  /**
   * 志愿者类型选择变化
   */
  onVolunteerTypeChange(e) {
    this.setData({
      volunteerType: e.detail.value
    })
    this.checkStepCanProceed()
  },

  /**
   * 选择职业
   */
  selectProfession() {
    const professions = ['学生', '教师', '医生', '护士', '退休人员', '社会工作者', '其他']
    wx.showActionSheet({
      itemList: professions,
      success: (res) => {
        this.setData({
          profession: professions[res.tapIndex]
        })
      }
    })
  },

  /**
   * 服务范围选择变化
   */
  onServiceRangeChange(e) {
    this.setData({
      serviceRange: e.detail.value
    })
  },

  /**
   * 身份选择
   */
  selectIdentity(e) {
    const role = e.currentTarget.dataset.role
    this.setData({
      selectedRole: role
    })
    this.checkStepCanProceed()
  },

  /**
   * 检查当前步骤是否可以继续
   */
  checkStepCanProceed() {
    const { currentStep, selectedArea, realName, password, idCard, gender, avatarFiles, volunteerSkills, volunteerType, selectedRole } = this.data
    
    let canProceed = false
    
    switch (currentStep) {
      case 0: // 基本信息
        canProceed = selectedArea && realName && password && idCard && gender && avatarFiles.length > 0
        break
      case 1: // 志愿者信息
        canProceed = volunteerSkills.length > 0 && volunteerType
        break
      case 2: // 身份选择
        canProceed = !!selectedRole
        break
    }
    
    this.setData({ canProceed })
  },

  /**
   * 下一步
   */
  nextStep() {
    if (!this.data.canProceed) return
    
    const nextStep = this.data.currentStep + 1
    this.setData({
      currentStep: nextStep
    })
    this.checkStepCanProceed()
  },

  /**
   * 保存当前步骤
   */
  saveCurrentStep() {
    this.showToast('当前步骤已保存', 'success')
  },

  /**
   * 提交注册
   */
  async submitRegistration() {
    if (!this.data.canProceed || this.data.isLoading) return
    
    this.setData({ isLoading: true })
    
    try {
      // 模拟提交注册信息
      const registrationData = {
        area: this.data.selectedArea,
        realName: this.data.realName,
        password: this.data.password,
        idCard: this.data.idCard,
        gender: this.data.gender,
        avatar: this.data.avatarFiles[0]?.url,
        skills: this.data.volunteerSkills,
        volunteerType: this.data.volunteerType,
        profession: this.data.profession,
        serviceRange: this.data.serviceRange,
        role: this.data.selectedRole
      }
      
      console.log('提交注册信息:', registrationData)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      this.showToast('注册成功！', 'success')
      
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index'
        })
      }, 1500)
      
    } catch (error) {
      console.error('注册失败:', error)
      this.showToast('注册失败，请重试', 'error')
    } finally {
      this.setData({ isLoading: false })
    }
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
  
})
