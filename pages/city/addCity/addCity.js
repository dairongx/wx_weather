// pages/city/addCity/addCity.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addr: [],
    city: '',
    searchList: []
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
    getCurrentPages()[1].add(this.data.addr)
  },

  // 输入地址
  inputCity(e) {
    let reg = new RegExp('^[\u4E00-\u9FA5]+$')
    let addr = this.data.addr
    let city = e.detail.value
    if (!city.trim()) return
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

  // 添加城市
  addcity() {
    let that = this
    let city = this.data.city
    if (city) {
      app.getGeocoder(city).then(location => {
        if (location) {
          wx.getStorage({
            key: 'location',
            success: function(res) {
              var locationArr = res.data;
              if (!locationArr.includes(location)) {
                locationArr.push(location)
                wx.setStorage({
                  key: 'location',
                  data: locationArr,
                })
                that.setData({
                  addr: that.data.addr.concat(city)
                })
                wx.navigateBack({})
              } else {
                wx.showToast({
                  title: '已有该城市',
                  icon: 'none',
                  duration: 1500
                })
                that.setData({
                  city: ''
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
  },
})