const { authManager } = require('../../utils/auth.js')
const api = require('../../utils/api.js')

Page({
  data: {
    isElderly: false,
    userInfo: null,
    isSubmitting: false,
    
    // 表单数据
    formData: {
      name: '',
      gender: '',
      age: '',
      phone: '',
      idCard: '',
      region: '',
      address: '',
      // 老人端特有字段
      chronicDiseases: '',
      allergies: '',
      emergencyContact: '',
      // 志愿者端特有字段
      specialties: [],
      availableTime: [],
      introduction: ''
    },

    // 志愿者服务专长选项
    specialtyOptions: [
      { value: 'housework', label: '🏠 家务清洁' },
      { value: 'shopping', label: '🛒 代购买菜' },
      { value: 'medical', label: '🏥 陪同就医' },
      { value: 'chat', label: '💬 聊天陪伴' },
      { value: 'repair', label: '🔧 维修服务' },
      { value: 'cooking', label: '🍳 做饭服务' },
      { value: 'transport', label: '🚗 接送服务' },
      { value: 'tech', label: '📱 技术帮助' }
    ],

    // 服务时间选项
    timeSlots: [
      { value: 'morning', label: '🌅 上午 (8:00-12:00)' },
      { value: 'afternoon', label: '☀️ 下午 (12:00-18:00)' },
      { value: 'evening', label: '🌙 晚上 (18:00-22:00)' },
      { value: 'weekend', label: '🎉 周末全天' },
      { value: 'flexible', label: '⏰ 时间灵活' }
    ]
  },

  onLoad(options) {
    console.log('个人信息编辑页面加载', options)
    
    // 获取用户角色
    const isElderly = options.role === 'elderly'
    this.setData({ isElderly })
    
    this.initUserData()
  },

  /**
   * 初始化用户数据
   */
  async initUserData() {
    try {
      const userInfo = authManager.getUserInfo()
      if (!userInfo) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        wx.navigateBack()
        return
      }

      this.setData({ userInfo })
      
      // 填充表单数据
      this.fillFormData(userInfo)
      
      // 加载完整的用户资料
      await this.loadUserProfile()
      
    } catch (error) {
      console.error('初始化用户数据失败:', error)
      wx.showToast({
        title: '加载用户信息失败',
        icon: 'none'
      })
    }
  },

  /**
   * 填充表单数据
   */
  fillFormData(userInfo) {
    const formData = {
      name: userInfo.name || userInfo.realName || '',
      gender: userInfo.gender || '',
      age: userInfo.age ? String(userInfo.age) : '',
      phone: userInfo.phone || '',
      idCard: userInfo.idCard || '',
      region: userInfo.region || '',
      address: userInfo.address || '',
      // 老人端字段
      chronicDiseases: userInfo.chronicDiseases || '',
      allergies: userInfo.allergies || '',
      emergencyContact: userInfo.emergencyContact || '',
      // 志愿者端字段
      specialties: userInfo.specialties || [],
      availableTime: userInfo.availableTime || [],
      introduction: userInfo.introduction || ''
    }

    this.setData({ formData })
    console.log('表单数据已填充:', formData)
  },

  /**
   * 加载完整用户资料
   */
  async loadUserProfile() {
    try {
      // TODO: 调用API获取完整用户资料
      // const profileData = await api.get('/user/profile', { userId: this.data.userInfo.userId })
      // this.fillFormData(profileData)
      
      console.log('用户资料加载完成')
    } catch (error) {
      console.error('加载用户资料失败:', error)
    }
  },

  /**
   * 获取头像文字
   */
  getAvatarText() {
    const { formData } = this.data
    if (formData.name) {
      return formData.name.charAt(0).toUpperCase()
    }
    return this.data.isElderly ? '老' : '志'
  },

  /**
   * 输入框内容变化
   */
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`formData.${field}`]: value
    })
  },

  /**
   * 选择性别
   */
  selectGender(e) {
    const { gender } = e.currentTarget.dataset
    this.setData({
      'formData.gender': gender
    })
  },

  /**
   * 选择地区
   */
  selectRegion() {
    wx.chooseLocation({
      success: (res) => {
        const region = `${res.address}`
        this.setData({
          'formData.region': region,
          'formData.address': res.name || ''
        })
      },
      fail: (error) => {
        console.log('选择地区失败:', error)
        // 如果用户拒绝授权，提供手动输入选项
        wx.showModal({
          title: '选择地区',
          content: '无法获取位置信息，请手动输入地区',
          editable: true,
          placeholderText: '请输入所在地区',
          success: (res) => {
            if (res.confirm && res.content.trim()) {
              this.setData({
                'formData.region': res.content.trim()
              })
            }
          }
        })
      }
    })
  },

  /**
   * 切换服务专长
   */
  toggleSpecialty(e) {
    const { value } = e.currentTarget.dataset
    const { specialties } = this.data.formData
    
    let newSpecialties = [...specialties]
    const index = newSpecialties.indexOf(value)
    
    if (index > -1) {
      newSpecialties.splice(index, 1)
    } else {
      newSpecialties.push(value)
    }
    
    this.setData({
      'formData.specialties': newSpecialties
    })
  },

  /**
   * 切换服务时间
   */
  toggleTimeSlot(e) {
    const { value } = e.currentTarget.dataset
    const { availableTime } = this.data.formData
    
    let newTimeSlots = [...availableTime]
    const index = newTimeSlots.indexOf(value)
    
    if (index > -1) {
      newTimeSlots.splice(index, 1)
    } else {
      newTimeSlots.push(value)
    }
    
    this.setData({
      'formData.availableTime': newTimeSlots
    })
  },

  /**
   * 更换头像
   */
  changeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        
        // TODO: 上传头像到服务器
        wx.showLoading({ title: '上传中...' })
        
        // 模拟上传
        setTimeout(() => {
          wx.hideLoading()
          wx.showToast({
            title: '头像更新成功',
            icon: 'success'
          })
          
          // TODO: 更新头像URL
          console.log('头像文件路径:', tempFilePath)
        }, 2000)
      },
      fail: (error) => {
        console.log('选择头像失败:', error)
      }
    })
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { formData } = this.data
    
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入真实姓名',
        icon: 'none'
      })
      return false
    }

    if (!formData.phone.trim()) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return false
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(formData.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return false
    }

    if (!formData.gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })
      return false
    }

    if (!formData.age.trim()) {
      wx.showToast({
        title: '请输入年龄',
        icon: 'none'
      })
      return false
    }

    const age = parseInt(formData.age)
    if (isNaN(age) || age < 1 || age > 120) {
      wx.showToast({
        title: '请输入正确的年龄',
        icon: 'none'
      })
      return false
    }

    // 老人端特殊验证
    if (this.data.isElderly) {
      if (!formData.emergencyContact.trim()) {
        wx.showToast({
          title: '请输入紧急联系人',
          icon: 'none'
        })
        return false
      }
    } else {
      // 志愿者端特殊验证
      if (formData.specialties.length === 0) {
        wx.showToast({
          title: '请至少选择一项服务专长',
          icon: 'none'
        })
        return false
      }

      if (formData.availableTime.length === 0) {
        wx.showToast({
          title: '请至少选择一个服务时间',
          icon: 'none'
        })
        return false
      }
    }

    return true
  },

  /**
   * 提交个人信息
   */
  async submitProfile() {
    if (!this.validateForm()) {
      return
    }

    if (this.data.isSubmitting) {
      return
    }

    this.setData({ isSubmitting: true })

    try {
      const { userInfo, formData } = this.data
      
      // 准备提交数据
      const submitData = {
        userId: userInfo.userId,
        ...formData,
        age: parseInt(formData.age)
      }

      console.log('提交个人信息:', submitData)

      // 调用API更新个人信息
      await this.updateProfile(submitData)

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('保存个人信息失败:', error)
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ isSubmitting: false })
    }
  },

  /**
   * 调用API更新个人信息
   */
  async updateProfile(profileData) {
    try {
      // TODO: 实际API调用
      // const result = await api.post('/user/profile', profileData)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 更新本地存储的用户信息
      const updatedUserInfo = {
        ...this.data.userInfo,
        ...profileData
      }
      
      // 更新认证管理器中的用户信息
      authManager.updateUserInfo(updatedUserInfo)
      
      console.log('个人信息更新成功')
      
    } catch (error) {
      console.error('API调用失败:', error)
      throw error
    }
  },

  /**
   * 返回按钮点击
   */
  onBackClick() {
    // 检查是否有未保存的更改
    wx.showModal({
      title: '确认返回',
      content: '您有未保存的更改，确定要返回吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  }
})




