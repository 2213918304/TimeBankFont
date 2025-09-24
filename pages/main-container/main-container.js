const { authManager } = require('../../utils/auth.js')

Page({
  data: {
    currentRole: "family", // "family" | "elderly"
    currentPageIndex: 0,   // 0=首页, 1=服务, 2=监控/聊天, 3=钱包, 4=我的
    selectedCard: null,
    userInfo: null,
    isElderly: false,      // 计算属性：是否为老人端
    
    // 聊天数据
    messages: [{
      type: "ai",
      content: "您好！我是您的专属AI助手小罗。我可以帮您发布服务需求、回答问题、提供健康建议。有什么需要帮助的吗？"
    }],
    inputText: "",
    isTyping: false,
    isRecording: false,
    scrollTop: 0
  },
  
  onLoad(options) {
    console.log('主容器加载，参数:', options)
    
    // 检查登录状态
    if (!authManager.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    
    // 获取用户信息
    const userInfo = authManager.getUserInfo()
    if (userInfo) {
      const currentRole = this.getRoleFromUserRole(userInfo.role)
      this.setData({
        userInfo,
        currentRole,
        isElderly: currentRole === 'elderly'
      })
      console.log('用户信息:', userInfo)
      console.log('界面角色:', currentRole, '是否老人端:', currentRole === 'elderly')
      console.log('底部导航栏数据:', { 
        isElderly: currentRole === 'elderly', 
        activeIndex: this.data.currentPageIndex 
      })
    }
    
    // 处理URL参数
    if (options.role) {
      this.setData({
        currentRole: options.role,
        isElderly: options.role === 'elderly'
      })
    }
  },
  
  /**
   * 转换用户角色到界面角色
   * 家属和志愿者都属于志愿者端
   */
  getRoleFromUserRole(userRole) {
    switch(userRole) {
      case 'ELDERLY':
        return 'elderly'
      case 'FAMILY_MEMBER':
      case 'VOLUNTEER':
        return 'family'  // 统一为家属端（志愿者端）
      default:
        return 'elderly'
    }
  },
  
  /**
   * 获取导航标题
   */
  getNavTitle() {
    const elderlyPages = ["时间银行", "找人帮忙", "AI助手", "我的时间币", "我的"];
    const volunteerPages = ["时间银行", "服务管理", "实时监控", "时间币管理", "我的"];
    return this.data.currentRole === 'elderly' ? 
           elderlyPages[this.data.currentPageIndex] : 
           volunteerPages[this.data.currentPageIndex];
  },
  
  /**
   * 角色切换
   */
  toggleRole() {
    const newRole = this.data.currentRole === "family" ? "elderly" : "family";
    this.setData({
      currentRole: newRole,
      isElderly: newRole === 'elderly'
    });
    console.log('角色切换为:', newRole);
  },
  
  /**
   * 导航切换
   */
  onNavChange(e) {
    console.log('主容器接收到导航切换事件:', e)
    console.log('事件详情:', e.detail)
    console.log('事件类型:', e.type)
    
    const index = e.detail
    console.log('导航切换到索引:', index, '当前索引:', this.data.currentPageIndex)
    
    // 先显示一个提示，确认事件被接收
    wx.showToast({
      title: `点击了导航${index}`,
      icon: 'none',
      duration: 1000
    })
    
    // 验证索引是否有效
    if (index === undefined || index === null) {
      console.error('导航索引无效:', index)
      return
    }
    
    // 如果点击的是当前页面，不需要切换
    if (index === this.data.currentPageIndex) {
      console.log('已在当前页面，无需切换')
      return
    }
    
    // 切换页面索引
    this.setData({
      currentPageIndex: index
    });
    
    // 如果需要跳转到其他页面（而不是在同一个容器内切换）
    // 可以在这里添加页面跳转逻辑
    const routes = this.data.isElderly ? [
      '/pages/main-container/main-container', // 0 - 首页
      '/pages/services/services',             // 1 - 服务
      '/pages/chat/chat',                     // 2 - AI助手
      '/pages/wallet/wallet',                 // 3 - 时间币
      '/pages/profile/profile'                // 4 - 我的
    ] : [
      '/pages/main-container/main-container', // 0 - 首页
      '/pages/services/services',             // 1 - 服务
      '/pages/monitor/monitor',               // 2 - 监控
      '/pages/wallet/wallet',                 // 3 - 时间币
      '/pages/profile/profile'                // 4 - 我的
    ]
    
    console.log('路由数组:', routes)
    console.log('当前角色:', this.data.isElderly ? 'elderly' : 'family')
    
    // 如果是首页(index 0)，保持在当前容器内
    // 其他页面跳转到对应的单独页面
    if (index !== 0) {
      const targetUrl = routes[index] + '?role=' + (this.data.isElderly ? 'elderly' : 'family')
      console.log('准备跳转到:', targetUrl)
      
      wx.navigateTo({
        url: targetUrl,
        success: () => {
          console.log('页面跳转成功到:', targetUrl)
        },
        fail: (err) => {
          console.error('页面跳转失败:', err)
          console.error('目标URL:', targetUrl)
          wx.showToast({
            title: '页面跳转失败: ' + (err.errMsg || '未知错误'),
            icon: 'none',
            duration: 3000
          })
        }
      })
    }
  },
  
  /**
   * 跳转到发布页面
   */
  goToPublish() {
    wx.navigateTo({
      url: `/pages/publish/publish?role=${this.data.currentRole}`
    });
  },
  
  /**
   * 跳转到充值页面
   */
  goToRecharge() {
    if (this.data.currentRole === 'elderly') {
      wx.navigateTo({
        url: '/pages/elderly-recharge/elderly-recharge'
      });
    } else {
      wx.navigateTo({
        url: '/pages/recharge/recharge'
      });
    }
  },
  
  /**
   * 跳转到服务页面
   */
  goToServices() {
    wx.navigateTo({
      url: `/pages/services/services?role=${this.data.currentRole}`
    });
  },
  
  /**
   * 跳转到聊天页面
   */
  goToChat() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    });
  },
  
  /**
   * 跳转到钱包页面
   */
  goToWallet() {
    wx.navigateTo({
      url: `/pages/wallet/wallet?role=${this.data.currentRole}`
    });
  },
  
  /**
   * 紧急求助
   */
  emergencyCall() {
    wx.showModal({
      title: '紧急求助',
      content: '是否立即拨打紧急联系人电话？',
      confirmText: '立即拨打',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '138****5678' // 这里应该是实际的紧急联系人电话
          }).catch(() => {
            wx.showToast({
              title: '拨打电话失败',
              icon: 'none'
            })
          })
        }
      }
    })
  },
  
  /**
   * 拨打电话
   */
  callElder() {
    wx.makePhoneCall({
      phoneNumber: '138****5678',
      success: () => {
        console.log('拨打电话成功');
      },
      fail: (err) => {
        console.error('拨打电话失败:', err);
        wx.showToast({
          title: '拨打失败',
          icon: 'error'
        });
      }
    });
  },
  
  /**
   * 紧急求助
   */
  emergencyCall() {
    wx.showModal({
      title: '紧急求助',
      content: '确定要发起紧急求助吗？系统将立即通知您的家人和附近的志愿者。',
      confirmText: '确定求助',
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '紧急求助已发送',
            icon: 'success'
          });
          // 这里可以调用紧急求助API
        }
      }
    });
  },
  
  /**
   * 刷新数据
   */
  refreshData() {
    wx.showToast({
      title: '数据已刷新',
      icon: 'success'
    });
    // 这里可以调用刷新数据的API
  },
  
  /**
   * 发送消息
   */
  sendMessage() {
    const { inputText } = this.data;
    if (!inputText.trim()) return;
    
    // 添加用户消息
    const userMessage = {
      type: "user",
      content: inputText.trim()
    };
    
    this.setData({
      messages: [...this.data.messages, userMessage],
      inputText: "",
      isTyping: true
    });
    
    // 模拟AI回复
    setTimeout(() => {
      const aiMessage = {
        type: "ai",
        content: "收到您的消息，我正在为您处理..."
      };
      
      this.setData({
        messages: [...this.data.messages, aiMessage],
        isTyping: false
      });
    }, 1000);
  },
  
  /**
   * 输入文本变化
   */
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    });
  },
  
  /**
   * 切换语音录制
   */
  toggleVoice() {
    this.setData({
      isRecording: !this.data.isRecording
    });
    
    if (this.data.isRecording) {
      wx.showToast({
        title: '开始录音',
        icon: 'none'
      });
    } else {
      wx.showToast({
        title: '录音结束',
        icon: 'none'
      });
    }
  },
  
  /**
   * 编辑个人信息
   */
  editProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },
  
  /**
   * 显示设置
   */
  showSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    });
  },
  
  /**
   * 登出
   */
  async logout() {
    wx.showModal({
      title: '确认登出',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await authManager.logout();
            wx.redirectTo({
              url: '/pages/login/login'
            });
          } catch (error) {
            console.error('登出失败:', error);
            wx.showToast({
              title: '登出失败',
              icon: 'error'
            });
          }
        }
      }
    });
  }
});