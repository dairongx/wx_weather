//app.js
App({
  onLaunch: function () {
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  // 将城市名转换成坐标
  getGeocoder(addr) {
    let that = this
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.map.baidu.com/geocoder/v2/?address=${addr}&output=json&ak=${that.globalData.ak}`,
        success(res) {
          if (res.errMsg == 'request:ok') {
            let location = `${res.data.result.location.lng},${res.data.result.location.lat}`
            resolve(location)
          } else {
            reject(res.errMsg)
          }
        }
      })
    })
  },
  globalData: {
    userInfo: null,
    ak: 'MDAXl2e8z0suEvdSTSTNadQjK1KgVps7'
  }
})