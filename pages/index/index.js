//index.js
//获取应用实例
const bmap = require('../../libs/bmap-wx.js')
const app = getApp()

Page({
  data: {
    weatherData: [],
    addr: [],
    current: 0
  },


  onLoad: function() {
    let that = this;
    that.getLocation().then(() => {
      wx.getStorage({
        key: 'location',
        success: function(res) {
          if (Array.isArray(res.data)) {
            res.data.forEach(item => {
              that.mapWeather(item)
            })
          }
        }
      })
    }).catch(() => {
      wx.redirectTo({
        url: '/pages/authorize/index',
      })
    })
  },

  // 获取天气信息
  mapWeather(location) {
    let that = this;
    let BMap = new bmap.BMapWX({
      ak: app.globalData.ak
    });
    // 发起weather请求 
    BMap.weather({
      location: location,
      fail: function(data) {
        console.log(data)
      },
      success: function(res) {
        res.time = new Date().toTimeString().slice(0, 5)
        res.temperature = res.currentWeather[0].date.split('：')[1].split(')')[0]
          that.setData({
            weatherData: that.data.weatherData.concat(res),
            addr: that.data.addr.concat(res.currentWeather[0].currentCity)
          })
      }
    });
  },

  // 获取当前位置
  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        success(res) {
          let loca = `${res.longitude},${res.latitude}`
          wx.getStorage({
            key: 'location',
            success: function(data) {
              let location = data.data
              if (location.includes(loca)) {
                return;
              } else {
                location.splice(0, 1, loca)
                wx.setStorage({
                  key: 'location',
                  data: location,
                })
              }
            },
            fail: function(err) {
              wx.setStorage({
                key: 'location',
                data: [loca],
              })
            },
            complete: function() {
              resolve()
            }
          })
        },
        fail(err) {
          reject()
        }
      })
    })
  },

  swiperHandle(e) {
    let current = e.detail.current;
    this.setData({
      current: current
    })
  },

  addCity() {
    let addr = JSON.stringify(this.data.addr)
    wx.navigateTo({
      url: '/pages/addCity/addCity?addr=' + addr,
    })
  },
})