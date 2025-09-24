const { authManager } = require('../../utils/auth.js')

Page({
  data: {
    userInfo: null,
    familyMembers: [
      // 模拟数据，实际应从API获取
      {
        id: 1,
        name: '张小明',
        relation: '儿子',
        phone: '138****5678',
        isMainGuardian: true
      },
      {
        id: 2,
        name: '李小红',
        relation: '女儿',
        phone: '139****8765',
        isMainGuardian: false
      }
    ],
    volunteers: [
      // 模拟数据，实际应从API获取
      {
        id: 1,
        name: '王志愿',
        specialty: '生活照料',
        serviceCount: 15,
        rating: 4.9
      }
    ],
    healthInfo: {
      chronicDiseases: '高血压',
      allergies: '青霉素',
      emergencyContact: '张小明 138****5678'
    }
  },

  onLoad(options) {
    console.log('老人端个人中心页面加载')
    this.initUserData()
  },

  onShow() {
    this.loadUserInfo()
  },

  /**
   * 初始化用户数据
   */
  async initUserData() {
    try {
      const userInfo = authManager.getUserInfo()
      if (userInfo) {
        this.setData({ userInfo })
        console.log('用户信息:', userInfo)
        
        // 加载关联的家属和志愿者信息
        await this.loadRelationData()
      } else {
        console.log('未获取到用户信息')
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }
    } catch (error) {
      console.error('初始化用户数据失败:', error)
    }
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      const userInfo = authManager.getUserInfo()
      if (userInfo) {
        this.setData({ userInfo })
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  },

  /**
   * 加载关联数据（家属、志愿者）
   */
  async loadRelationData() {
    try {
      // TODO: 从API加载真实的家属和志愿者数据
      console.log('加载关联数据...')
      
      // 模拟API调用延迟
      setTimeout(() => {
        console.log('关联数据加载完成')
      }, 1000)
    } catch (error) {
      console.error('加载关联数据失败:', error)
    }
  },

  /**
   * 获取头像文字
   */
  getAvatarText() {
    const { userInfo } = this.data
    if (userInfo && userInfo.name) {
      return userInfo.name.charAt(0).toUpperCase()
    }
    return '老'
  },

  /**
   * 获取用户显示名称
   */
  getUserDisplayName() {
    const { userInfo } = this.data
    if (!userInfo) return '尊敬的老人用户'
    
    // 优先显示真实姓名，其次用户名，最后显示手机号
    if (userInfo.name) {
      return userInfo.name
    } else if (userInfo.realName) {
      return userInfo.realName
    } else if (userInfo.username) {
      return userInfo.username
    } else if (userInfo.phone) {
      // 隐藏手机号中间四位
      const phone = userInfo.phone
      return phone.substring(0, 3) + '****' + phone.substring(7)
    } else {
      return '尊敬的老人用户'
    }
  },

  /**
   * 跳转到充值页面
   */
  goToRecharge() {
    wx.navigateTo({
      url: '/pages/elderly-recharge/elderly-recharge'
    })
  },

  /**
   * 联系家属
   */
  contactFamily(e) {
    const familyId = e.currentTarget.dataset.id
    const family = this.data.familyMembers.find(f => f.id === familyId)
    
    if (family) {
      wx.showModal({
        title: '联系家属',
        content: `是否拨打电话给${family.name}？`,
        success: (res) => {
          if (res.confirm) {
            wx.makePhoneCall({
              phoneNumber: family.phone.replace(/\*/g, '1') // 模拟完整号码
            }).catch(err => {
              console.error('拨打电话失败:', err)
              wx.showToast({
                title: '拨打电话失败',
                icon: 'none'
              })
            })
          }
        }
      })
    }
  },

  /**
   * 联系志愿者
   */
  contactVolunteer(e) {
    const volunteerId = e.currentTarget.dataset.id
    const volunteer = this.data.volunteers.find(v => v.id === volunteerId)
    
    if (volunteer) {
      wx.navigateTo({
        url: `/pages/chat/chat?targetId=${volunteerId}&targetName=${volunteer.name}&role=elderly`
      })
    }
  },

  /**
   * 显示绑定码
   */
  showBindingCode() {
    const { userInfo } = this.data
    const bindingCode = userInfo ? (userInfo.bindingCode || '123456') : '123456'
    
    wx.showModal({
      title: '我的绑定码',
      content: `您的绑定码是：${bindingCode}\n\n请将此绑定码告知您的家属，他们可以通过此绑定码关联您的账户，更好地为您提供服务。`,
      confirmText: '复制绑定码',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: bindingCode,
            success: () => {
              wx.showToast({
                title: '绑定码已复制',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  /**
   * 绑定志愿者
   */
  bindVolunteer() {
    wx.showModal({
      title: '绑定志愿者',
      content: '请输入志愿者的绑定码，绑定后志愿者可以为您提供专属服务',
      editable: true,
      placeholderText: '请输入6位绑定码',
      success: (res) => {
        if (res.confirm) {
          const bindCode = res.content.trim()
          if (bindCode.length === 6) {
            wx.showLoading({ title: '正在绑定...' })
            
            // 模拟API调用
            setTimeout(() => {
              wx.hideLoading()
              wx.showToast({ 
                title: '绑定成功！',
                icon: 'success'
              })
              
              // 重新加载数据
              this.loadRelationData()
            }, 2000)
          } else {
            wx.showToast({
              title: '请输入6位绑定码',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  /**
   * 编辑健康信息
   */
  editHealthInfo() {
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit?role=elderly&focus=health'
    })
  },

  /**
   * 显示个人偏好设置
   */
  showSettings() {
    wx.showActionSheet({
      itemList: ['字体大小设置', '语音播报设置', '通知设置', '界面主题设置'],
      success: (res) => {
        const settings = ['字体大小', '语音播报', '通知', '界面主题']
        wx.showToast({
          title: `${settings[res.tapIndex]}设置功能开发中`,
          icon: 'none'
        })
      }
    })
  },

  /**
   * 显示紧急联系方式
   */
  showEmergencyContacts() {
    wx.showModal({
      title: '🚨 紧急联系方式',
      content: '紧急服务热线：120\n社区服务热线：400-888-9999\n家属紧急联系：138****5678',
      confirmText: '拨打120',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '120'
          }).catch(err => {
            console.error('拨打急救电话失败:', err)
          })
        }
      }
    })
  },

  /**
   * 显示服务记录
   */
  showServiceHistory() {
    wx.showToast({
      title: '服务记录功能开发中',
      icon: 'none'
    })
  },

  /**
   * 显示帮助中心
   */
  showHelp() {
    wx.showModal({
      title: '❓ 帮助中心',
      content: '如何使用时间银行？\n\n1. 发布服务需求\n2. 等待志愿者响应\n3. 确认服务完成\n4. 评价服务质量\n\n如需更多帮助，请联系客服：400-888-9999',
      confirmText: '联系客服',
      cancelText: '我知道了',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '4008889999'
          }).catch(err => {
            console.error('拨打客服电话失败:', err)
          })
        }
      }
    })
  },

  /**
   * 显示意见反馈
   */
  showFeedback() {
    wx.showToast({
      title: '意见反馈功能开发中',
      icon: 'none'
    })
  },

  /**
   * 退出登录
   */
  async logout() {
    wx.showModal({
      title: '确认退出',
      content: '您确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await authManager.logout()
            wx.reLaunch({
              url: '/pages/login/login'
            })
          } catch (error) {
            console.error('退出登录失败:', error)
            // 即使退出失败，也跳转到登录页
            wx.reLaunch({
              url: '/pages/login/login'
            })
          }
        }
      }
    })
  },

  /**
   * 底部导航切换
   */
  onNavChange(e) {
    const index = e.detail
    const routes = [
      '/pages/index/index',
      '/pages/services/services', 
      '/pages/chat/chat',
      '/pages/wallet/wallet',
      '/pages/elderly-profile/elderly-profile'
    ]
    
    if (index !== 4) { // 当前已在个人中心页面
      wx.navigateTo({
        url: routes[index] + '?role=elderly'
      })
    }
  }
})
