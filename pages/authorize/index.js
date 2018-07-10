// pages/authorize/index.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  onLoad: function(options) {

  },
  authorize(e) {
    if (e.detail.authSetting['scope.userLocation']) {
      wx.showToast({
        title: '授权成功！',
      })
      wx.redirectTo({
        url: '/pages/index/index',
      })
    } else {
      wx.showToast({
        title: '授权失败！',
        icon: 'none'
      })
    }
  }

})