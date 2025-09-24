Page({
  data: {
    currentRate: 4
  },

  onLoad: function (options) {
    console.log('TDesign Demo页面加载');
  },

  onReady: function () {
    
  },

  onShow: function () {
    
  },

  onHide: function () {
    
  },

  onUnload: function () {
    
  },

  onPullDownRefresh: function () {
    
  },

  onReachBottom: function () {
    
  },

  onShareAppMessage: function () {
    
  },

  // 按钮点击事件
  onButtonTap: function(e) {
    console.log('按钮被点击', e);
    this.showToast('按钮被点击了！');
  },

  // 输入框变化事件
  onInputChange: function(e) {
    console.log('输入框内容变化', e.detail.value);
  },

  // 开关变化事件
  onSwitchChange: function(e) {
    console.log('开关状态变化', e.detail.value);
    this.showToast(`开关状态：${e.detail.value ? '开启' : '关闭'}`);
  },

  // 评分变化事件
  onRateChange: function(e) {
    console.log('评分变化', e.detail.value);
    this.setData({
      currentRate: e.detail.value
    });
    this.showToast(`您给了 ${e.detail.value} 星评分`);
  },

  // 单元格点击事件
  onCellClick: function(e) {
    console.log('单元格被点击', e);
    this.showToast('单元格被点击了！');
  },

  // 显示Toast提示
  showToast: function(message = '操作成功！') {
    const toast = this.selectComponent('#t-toast');
    toast.show({
      message: message,
      theme: 'success',
      duration: 2000
    });
  },

  // 显示Dialog对话框
  showDialog: function() {
    const dialog = this.selectComponent('#t-dialog');
    dialog.show({
      title: '关于 TDesign',
      content: 'TDesign 是腾讯企业级设计语言，为时间银行提供美观、易用的UI组件库。',
      confirmBtn: '知道了',
      cancelBtn: '取消'
    });
  }
})

