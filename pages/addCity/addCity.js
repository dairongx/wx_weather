// pages/addCity/addCity.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addr: [],
    flag: false,
    city: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      addr: JSON.parse(options.addr)
    })
  },

  onUnload() {

  },

  // 将城市名转换成坐标
  getGeocoder(addr) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.map.baidu.com/geocoder/v2/?address=${addr}&output=json&ak=${app.globalData.ak}`,
        success(res) {
          console.log(res)
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

  toggle() {
    this.setData({
      flag: !this.data.flag
    })
  },

  // 输入地址
  inputCity(e) {
    let reg = new RegExp('^[\u4E00-\u9FA5]+$')
    let addr = this.data.addr
    let city = e.detail.value
    if (reg.test(city)) {
      if (addr.includes(city)) {
        wx.showToast({
          title: '已有该城市',
          icon: 'none',
          duration: 1500
        })
        this.setData({
          city: ''
        })
      } else {
        this.setData({
          city: e.detail.value
        })
      }
    } else {
      wx.showToast({
        title: '输入有误',
        icon: 'none',
        duration: 1500
      })
      this.setData({
        city: ''
      })
    }
  },

  // 选择城市
  bindRegionChange: function(e) {
    console.log(e)
    this.setData({
      city: e.detail.value
    })
  },

  // 添加城市
  addcity() {
    let that = this
    let city = JSON.stringify(this.data.city)
    if (city) {
      that.getGeocoder(city).then(location => {
        if (location) {
          wx.getStorage({
            key: 'location',
            success: function(res) {
              var locationArr = res.data;
              if(!locationArr.includes(location)) {
                locationArr.push(location)
                wx.setStorage({
                  key: 'location',
                  data: locationArr,
                })
                that.setData({
                  addr: that.data.addr.concat(city)
                })
              } else {
                wx.showToast({
                  title: '已有该城市',
                  icon: 'none',
                  duration: 1500
                })
              }
            },
          })
        }
      }).catch(err => {
        console.log(err)
        wx.showToast({
          title: '错误的地名',
          icon: 'none',
          duration: 1500
        })
      })
    }
  }

})