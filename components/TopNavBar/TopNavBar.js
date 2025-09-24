Component({
  properties: {
    title: {
      type: String,
      value: '时间银行'
    },
    subtitle: {
      type: String,
      value: ''
    },
    isElderly: {
      type: Boolean,
      value: false
    },
    showBack: {
      type: Boolean,
      value: false
    },
    showAction: {
      type: Boolean,
      value: false
    },
    actionText: {
      type: String,
      value: ''
    },
    actionIcon: {
      type: String,
      value: ''
    },
    showLogout: {
      type: Boolean,
      value: false
    }
  },
  
  data: {},
  
  lifetimes: {
    attached() {
      console.log('TopNavBar组件已加载')
      console.log('TopNavBar属性:', this.properties)
      console.log('TopNavBar数据:', this.data)
    }
  },

  observers: {
    '**': function(fields) {
      console.log('TopNavBar属性变化:', fields)
    }
  },
  
  methods: {
    /**
     * 返回按钮点击
     */
    onBackClick() {
      console.log('导航栏返回按钮点击')
      this.triggerEvent('back')
    },
    
    /**
     * 右侧操作按钮点击
     */
    onActionClick() {
      console.log('导航栏操作按钮点击')
      this.triggerEvent('action')
    },

    /**
     * 退出登录按钮点击
     */
    onLogoutClick() {
      console.log('导航栏退出登录按钮点击')
      this.triggerEvent('logout')
    }
  }
})