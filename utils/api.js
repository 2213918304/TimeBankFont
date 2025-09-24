/**
 * API工具类
 * 统一处理网络请求和认证
 */

// API基础配置
const BASE_URL = 'http://127.0.0.1:8081/api'  // 使用IP地址而不是localhost
const TIMEOUT = 30000

/**
 * 统一请求方法
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = wx.getStorageSync('access_token')
    
    // 默认请求头
    const headers = {
      'Content-Type': 'application/json'
    }
    
    // 如果有token，添加Authorization头
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // 发起请求
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers,
      timeout: TIMEOUT,
      success: (res) => {
        console.log('API请求成功:', options.url, res.data)
        
        // 检查HTTP状态码
        if (res.statusCode === 200) {
          // 检查业务状态码
          if (res.data.code === 200 || res.data.success === true) {
            resolve(res.data)
          } else {
            // 业务错误
            const errorMsg = res.data.message || res.data.msg || '请求失败'
            console.error('业务错误:', errorMsg)
            wx.showToast({
              title: errorMsg,
              icon: 'error',
              duration: 2000
            })
            reject(new Error(errorMsg))
          }
        } else if (res.statusCode === 401) {
          // 未授权，清除token并跳转登录
          wx.removeStorageSync('access_token')
          wx.removeStorageSync('user_info')
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/login/login'
            })
          }, 1500)
          reject(new Error('登录已过期'))
        } else {
          // 其他HTTP错误
          const errorMsg = `请求失败 (${res.statusCode})`
          console.error('HTTP错误:', errorMsg)
          wx.showToast({
            title: errorMsg,
            icon: 'error'
          })
          reject(new Error(errorMsg))
        }
      },
      fail: (err) => {
        console.error('网络请求失败:', err)
        console.error('完整错误信息:', JSON.stringify(err))
        console.error('请求URL:', BASE_URL + options.url)
        console.error('请求方法:', options.method || 'GET')
        console.error('请求数据:', options.data)
        
        let errorMsg = '网络连接失败'
        if (err.errMsg) {
          console.error('错误消息:', err.errMsg)
          if (err.errMsg.includes('timeout')) {
            errorMsg = '请求超时，请检查网络'
          } else if (err.errMsg.includes('Failed to fetch')) {
            errorMsg = '连接服务器失败，请确认后端服务正常运行在 http://127.0.0.1:8081'
          }
        }
        
        wx.showToast({
          title: errorMsg,
          icon: 'error',
          duration: 3000
        })
        reject(new Error(errorMsg))
      }
    })
  })
}

// 导出请求方法
module.exports = {
  get: (url, data) => request({ url, method: 'GET', data }),
  post: (url, data) => request({ url, method: 'POST', data }),
  put: (url, data) => request({ url, method: 'PUT', data }),
  delete: (url, data) => request({ url, method: 'DELETE', data }),
  BASE_URL
}


