Component({
  properties: {
    isElderly: {
      type: Boolean,
      value: false
    },
    activeIndex: {
      type: Number,
      value: 0
    }
  },
  
  data: {
    navItems: []
  },
  
  observers: {
    'isElderly': function(isElderly) {
      this.updateNavItems(isElderly)
    }
  },
  
  lifetimes: {
    attached() {
      console.log('底部导航栏组件加载，isElderly:', this.properties.isElderly)
      this.updateNavItems(this.properties.isElderly)
    }
  },
  
  methods: {
    updateNavItems(isElderly) {
      const navItems = isElderly ? [
        { icon: "🏠", text: "首页", tIcon: "home", page: "/pages/index/index" },
        { icon: "🛍️", text: "服务", tIcon: "shop", page: "/pages/services/services" },
        { icon: "💬", text: "助手", tIcon: "chat", page: "/pages/chat/chat" },
        { icon: "💰", text: "时间币", tIcon: "wallet", page: "/pages/wallet/wallet" },
        { icon: "👤", text: "我的", tIcon: "user", page: "/pages/profile/profile" }
      ] : [
        { icon: "🏠", text: "首页", tIcon: "home", page: "/pages/index/index" },
        { icon: "📋", text: "服务", tIcon: "list", page: "/pages/services/services" },
        { icon: "📊", text: "监控", tIcon: "chart-bar", page: "/pages/monitor/monitor" },
        { icon: "💰", text: "时间币", tIcon: "wallet", page: "/pages/wallet/wallet" },
        { icon: "👤", text: "我的", tIcon: "user", page: "/pages/profile/profile" }
      ]
      
      console.log('更新导航栏项目，isElderly:', isElderly, 'navItems:', navItems)
      this.setData({ navItems })
    },
    
    onNavClick(e) {
      const index = e.currentTarget.dataset.index
      console.log('底部导航点击:', index)
      console.log('点击事件详情:', e)
      console.log('dataset:', e.currentTarget.dataset)
      
      // 确保index是数字类型
      const numericIndex = parseInt(index)
      console.log('转换后的索引:', numericIndex)
      
      // 触发自定义事件
      console.log('准备触发nav-change事件，参数:', numericIndex)
      this.triggerEvent('nav-change', numericIndex)
      console.log('nav-change事件已触发')
    }
  }
})