// pages/setting/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ScreenBrightness: 0
  },

  onLoad: function (options) {
    this.getScreenBrightness()
  },

  // 获取屏幕亮度
  getScreenBrightness(){
    let that = this
    wx.getScreenBrightness({
      success:function(res){
        that.setData({
          ScreenBrightness: res.value*100
        })
      },
      fail: function(){

      }
    })
  },

  // 设置屏幕亮度
  changeHandle(e){
    let that = this
    let value = e.detail.value/100
    wx.setScreenBrightness({
      value: value,
      success: function(){
        that.getScreenBrightness()
      }
    })
  },
})