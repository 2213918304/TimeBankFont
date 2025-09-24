const auth = require('../../utils/auth.js')

Page({
  data: {
    isElderly: false,
    userInfo: null,
    isLoggedIn: false
  },
  
  onLoad(options) {
    this.checkLoginStatus()
    
    // 从参数中获取角色信息
    if (options.role) {
      this.setData({
        isElderly: options.role === 'elderly'
      })
    }
  },

  onShow() {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus()
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const isLoggedIn = auth.isLoggedIn()
    const userInfo = auth.getUserInfo()
    
    if (!isLoggedIn) {
      // 未登录，跳转到登录页
    wx.redirectTo({
        url: '../login/login'
      })
      return
    }
    
    // 已登录，根据用户角色设置当前角色
    let isElderly = false
    if (userInfo && userInfo.role) {
      isElderly = userInfo.role === 'elderly'
    }
    
    this.setData({
      isLoggedIn: isLoggedIn,
      userInfo: userInfo,
      isElderly: isElderly
    })
  },
  
  /**
   * 获取用户显示名称
   */
  getUserDisplayName() {
    const userInfo = this.data.userInfo
    if (!userInfo) {
      return '用户'
    }
    
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
      return '用户'
    }
  },
  
  /**
   * 获取用户角色显示
   */
  getUserRoleDisplay() {
    const userInfo = this.data.userInfo
    if (!userInfo || !userInfo.role) {
      return '用户'
    }
    
    switch (userInfo.role) {
      case 'elderly':
        return '老人用户'
      case 'family':
        return '家属'
      case 'volunteer':
        return '志愿者'
      default:
        return '用户'
    }
  },
  
  /**
   * 获取用户头像文字
   */
  getAvatarText() {
    const userInfo = this.data.userInfo
    if (!userInfo) {
      return '用'
    }
    
    if (userInfo.realName) {
      return userInfo.realName.charAt(0)
    } else if (userInfo.username) {
      return userInfo.username.charAt(0)
    } else {
      return '用'
    }
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
      confirmText: '退出',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          try {
            // 调用登出方法
            auth.logout()
            
            wx.showToast({
              title: '已退出登录',
              icon: 'success'
            })
            
            // 跳转到登录页
            setTimeout(() => {
              wx.reLaunch({
                url: '../login/login'
              })
            }, 1500)
          } catch (error) {
            console.error('退出登录失败:', error)
            wx.showToast({
              title: '退出失败，请重试',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 底部导航
  onNavChange(e) {
    const index = e.detail
    const routes = this.data.isElderly ? 
      ['../index/index', '../services/services', '../chat/chat', '../wallet/wallet', '../elderly-profile/elderly-profile'] :
      ['../index/index', '../services/services', '../monitor/monitor', '../wallet/wallet', '../profile/profile']
    
    if (index !== 4) { // 当前已在个人中心页面
      wx.navigateTo({
        url: routes[index] + (this.data.isElderly ? '?role=elderly' : '?role=family')
      })
    }
  },

  // 编辑个人信息
  editProfile() {
    const role = this.data.isElderly ? 'elderly' : 'family'
    wx.navigateTo({
      url: `/pages/profile-edit/profile-edit?role=${role}`
    })
  },
  
  // 绑定新老人
  bindNewElder() {
    wx.showModal({
      title: '绑定老人',
      content: '请输入老人的绑定码进行绑定',
      confirmText: '确定',
      cancelText: '取消'
    })
  },

  // 管理老人
  manageElder() {
    wx.showToast({
      title: '管理老人信息功能开发中',
      icon: 'none'
    })
  },

  // 联系家属
  contactFamily() {
    wx.showActionSheet({
      itemList: ['拨打电话', '发送短信'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({
            phoneNumber: '13800000000'
          })
        } else {
          wx.showToast({
            title: '发送短信功能开发中',
            icon: 'none'
          })
        }
      }
    })
  },
  
  // 显示绑定码
  showBindingCode() {
    wx.showModal({
      title: '我的绑定码',
      content: '您的绑定码是：123456\n请将此码提供给家属进行绑定',
      confirmText: '复制绑定码',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: '123456',
            success: () => {
              wx.showToast({
                title: '已复制到剪贴板',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },
  
  // 绑定志愿者（老人端专用）
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
            wx.showLoading({
              title: '正在绑定...'
            })
            
            // 模拟绑定过程
            setTimeout(() => {
              wx.hideLoading()
              wx.showToast({
                title: '绑定成功！',
                icon: 'success'
              })
              
              // 这里可以刷新页面数据
              this.initUserRole()
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
  
  // 通知设置
  showNotificationSettings() {
    wx.showToast({
      title: '通知设置功能开发中',
      icon: 'none'
    })
  },

  // 隐私设置
  showPrivacySettings() {
    wx.showToast({
      title: '隐私设置功能开发中',
      icon: 'none'
    })
  },
  
  // 帮助中心
  showHelp() {
    wx.showToast({
      title: '帮助中心功能开发中',
      icon: 'none'
    })
  },
  
  // 关于我们
  showAbout() {
    wx.showToast({
      title: '关于我们功能开发中',
      icon: 'none'
    })
  },

  // 健康档案
  showHealthInfo() {
    wx.showToast({
      title: '健康档案功能开发中',
      icon: 'none'
    })
  },
  
  // 家庭联系人
  showFamilyContacts() {
    wx.showToast({
      title: '家庭联系人功能开发中',
      icon: 'none'
    })
  },
  
  // 紧急联系方式
  showEmergencyContacts() {
    wx.showToast({
      title: '紧急联系方式功能开发中',
      icon: 'none'
    })
  },
  
  // 个人偏好设置
  showSettings() {
            wx.showToast({
      title: '个人偏好设置功能开发中',
      icon: 'none'
    })
  }
})