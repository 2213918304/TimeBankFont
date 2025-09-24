/**
 * 测试数据工具类
 * 用于快速导入测试用户数据到本地存储
 */

// 测试用户数据
const testUsers = {
  "testUsers": [
    {
      "id": 1,
      "phone": "13800138001",
      "password": "123456",
      "username": "测试用户1",
      "realName": "张小明",
      "role": "ELDERLY",
      "idCard": "210202199001011234",
      "gender": "male",
      "area": "大连市中山区",
      "avatar": "https://tdesign.gtimg.com/site/avatar.jpg",
      "skills": ["生活照料", "医疗陪护"],
      "volunteerType": "senior_active",
      "profession": "退休人员",
      "serviceRange": "street",
      "accessToken": "test_token_elderly_001",
      "userInfo": {
        "userId": 1,
        "phone": "13800138001",
        "username": "测试用户1",
        "realName": "张小明",
        "role": "ELDERLY",
        "avatar": "https://tdesign.gtimg.com/site/avatar.jpg",
        "area": "大连市中山区",
        "balance": 50,
        "totalIncome": 0,
        "totalExpense": 0
      }
    },
    {
      "id": 2,
      "phone": "13800138002",
      "password": "123456",
      "username": "测试志愿者",
      "realName": "李小红",
      "role": "VOLUNTEER",
      "idCard": "210202199002021234",
      "gender": "female",
      "area": "大连市西岗区",
      "avatar": "https://tdesign.gtimg.com/site/avatar.jpg",
      "skills": ["生活照料", "医疗陪护", "心理疏导"],
      "volunteerType": "student",
      "profession": "学生",
      "serviceRange": "district",
      "accessToken": "test_token_volunteer_002",
      "userInfo": {
        "userId": 2,
        "phone": "13800138002",
        "username": "测试志愿者",
        "realName": "李小红",
        "role": "VOLUNTEER",
        "avatar": "https://tdesign.gtimg.com/site/avatar.jpg",
        "area": "大连市西岗区",
        "balance": 20,
        "totalIncome": 15,
        "totalExpense": 5
      }
    },
    {
      "id": 3,
      "phone": "13800138003",
      "password": "123456",
      "username": "测试家属",
      "realName": "王大华",
      "role": "FAMILY_MEMBER",
      "idCard": "210202199003031234",
      "gender": "male",
      "area": "大连市沙河口区",
      "avatar": "https://tdesign.gtimg.com/site/avatar.jpg",
      "skills": ["生活照料", "家政服务"],
      "volunteerType": "social_member",
      "profession": "教师",
      "serviceRange": "street",
      "accessToken": "test_token_family_003",
      "userInfo": {
        "userId": 3,
        "phone": "13800138003",
        "username": "测试家属",
        "realName": "王大华",
        "role": "FAMILY_MEMBER",
        "avatar": "https://tdesign.gtimg.com/site/avatar.jpg",
        "area": "大连市沙河口区",
        "balance": 30,
        "totalIncome": 25,
        "totalExpense": 10
      }
    }
  ]
}

/**
 * 测试数据管理器
 */
const testDataManager = {
  /**
   * 获取所有测试用户
   */
  getAllTestUsers() {
    return testUsers.testUsers
  },

  /**
   * 根据手机号获取测试用户
   */
  getTestUserByPhone(phone) {
    return testUsers.testUsers.find(user => user.phone === phone)
  },

  /**
   * 根据角色获取测试用户
   */
  getTestUserByRole(role) {
    return testUsers.testUsers.find(user => user.role === role)
  },

  /**
   * 导入测试用户到本地存储
   */
  importTestUser(phone) {
    const user = this.getTestUserByPhone(phone)
    if (!user) {
      throw new Error(`未找到手机号为 ${phone} 的测试用户`)
    }

    // 保存登录信息到本地存储
    wx.setStorageSync('access_token', user.accessToken)
    wx.setStorageSync('user_info', user.userInfo)
    
    console.log('测试用户导入成功:', user.userInfo)
    return user
  },

  /**
   * 快速登录测试用户
   */
  quickLogin(role) {
    const user = this.getTestUserByRole(role)
    if (!user) {
      throw new Error(`未找到角色为 ${role} 的测试用户`)
    }

    this.importTestUser(user.phone)
    return user
  },

  /**
   * 清除所有测试数据
   */
  clearTestData() {
    wx.removeStorageSync('access_token')
    wx.removeStorageSync('user_info')
    console.log('测试数据已清除')
  },

  /**
   * 显示测试账号信息
   */
  showTestAccounts() {
    console.log('=== 时间银行测试账号 ===')
    console.log('老人端测试账号:')
    console.log('  手机号: 13800138001')
    console.log('  密码: 123456')
    console.log('  姓名: 张小明')
    console.log('  角色: ELDERLY')
    console.log('')
    console.log('志愿者端测试账号:')
    console.log('  手机号: 13800138002')
    console.log('  密码: 123456')
    console.log('  姓名: 李小红')
    console.log('  角色: VOLUNTEER')
    console.log('')
    console.log('家属端测试账号:')
    console.log('  手机号: 13800138003')
    console.log('  密码: 123456')
    console.log('  姓名: 王大华')
    console.log('  角色: FAMILY_MEMBER')
    console.log('========================')
  }
}

// 导出测试数据管理器
module.exports = {
  testDataManager,
  testUsers
}
