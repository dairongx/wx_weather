//index.js
//获取应用实例
const bmap = require('../../libs/bmap-wx.js')
const app = getApp()

Page({
  data: {
    weatherData: [],
    weatherList: [],
    addr: [],
    bg: [],
    location: [],
    current: 0,
    ptTitle: ['icon-chuanyizhishu', 'icon-xichezhishu', 'icon-ganmaozhishu', 'icon-yundongzhishu', 'icon-fangshaizhishu'],
    show: true,
    animationData: {},
    imgSrc: '',
    hidden: false
  },

  onLoad() {
    this.menuImg()
  },

  onShow() {
    let that = this
    let location = that.data.location
    wx.getStorage({
      key: 'location',
      success: function(res) {
        if (JSON.stringify(location) == JSON.stringify(res.data) && res.data.length > 0) {
          return;
        } else {
          that.setData({
            weatherData: [],
            weatherList: [],
            addr: [],
            location: []
          })
          that.getData()
        }
      },
      fail: function() {
        that.getData()
      }
    })
  },

  onHide(){
    this.closeMenu('close')
  },

  // 获取数据
  getData(arr) {
    let that = this;
    that.getLocation().then(() => {
      wx.getStorage({
        key: 'location',
        success: function(res) {
          if (Array.isArray(res.data)) {
            that.setData({
              location: res.data
            })
            let pro = res.data.map(item => {
              return that.mapWeather(item)
            })
            Promise.all(pro).then(() => {
              that.getWeatherData()
            })
          }
        },
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
    return new Promise((resolve, reject) => {
      BMap.weather({
        location: location,
        fail: function(data) {
          reject(data)
        },
        success: function(res) {
          res.time = new Date().toTimeString().slice(0, 5)
          res.temperature = res.currentWeather[0].date.split('：')[1].split(')')[0]
          res.location = location;
          that.setData({
            weatherList: that.data.weatherList.concat(res),
          })
          resolve()
        }
      });
    })
  },

  // 对数据按location排序
  getWeatherData() {
    let that = this,
      weatherData = [],
      addr = [],
      bg = [],
      weatherList = that.data.weatherList,
      location = that.data.location,
      weatherLen = weatherList.length,
      locationLen = location.length;
    if (weatherLen == locationLen) {
      for (let i = 0; i < locationLen; i++) {
        for (let j = 0; j < weatherLen; j++) {
          if (location[i] == weatherList[j].location) {
            weatherData.push(weatherList[j])
            addr.push(weatherList[j].currentWeather[0].currentCity) // 城市名
            bg.push(that.bgChange(weatherList[j].currentWeather[0].weatherDesc)) // 背景色
            let pm25 = weatherList[j].currentWeather[0].pm25
            weatherData[i].currentWeather[0].pm25 = that.pm25(pm25) + pm25 // pm25等级
          }
        }
      }
      that.setData({
        weatherData: weatherData,
        addr: addr,
        bg: bg
      })
    }
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

  // 背景
  bgChange(weather) {
    if (weather.includes('晴')) {
      return 'bg1'
    }
    if (weather.includes('雨')) {
      return 'bg2'
    }
    if (weather.includes('阴')) {
      return 'bg3'
    }
    return ''
  },

  // pm2.5
  pm25(pm) {
    if (pm < 50) {
      return '优'
    }
    if (pm > 50 && pm < 100) {
      return '良'
    }
    if (pm > 100 && pm < 150) {
      return '轻度污染'
    }
    if (pm > 150 && pm < 200) {
      return '中度污染'
    }
    if (pm > 200 && pm < 300) {
      return '重度污染'
    }
    if (pm > 300) {
      return '严重污染'
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    let that = this,
      current = that.data.current,
      location = that.data.location,
      bg = that.data.bg,
      weatherData = that.data.weatherData;
    let BMap = new bmap.BMapWX({
      ak: app.globalData.ak
    });
    BMap.weather({
      location: location[current],
      fail: function(data) {
        console.log(data)
      },
      success: function(res) {
        res.time = new Date().toTimeString().slice(0, 5)
        res.temperature = res.currentWeather[0].date.split('：')[1].split(')')[0]
        res.location = location;
        let pm25 = res.currentWeather[0].pm25
        res.currentWeather[0].pm25 = that.pm25(pm25) + pm25
        weatherData.splice(current, 1, res)
        bg.splice(current, 1, that.bgChange(res.currentWeather[0].weatherDesc))
        that.setData({
          weatherData: weatherData,
          bg: bg
        })
        wx.stopPullDownRefresh()
      }
    });
  },

  // scroll-view滚动事件
  scrollHandle(e) {
    let scrollTop = e.detail.scrollTop
    if (scrollTop > 160) {
      this.setData({
        show: false
      })
    } else {
      this.setData({
        show: true
      })
    }
  },

  // 显示菜单
  showMenu() {
    let animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })

    animation.opacity(1).translateX(0).step()
    animation.backgroundColor('rgba(0, 0, 0, 0.5)').step()
    this.setData({
      animationData: animation.export(),
      hidden: true
    })
  },

  // 隐藏菜单
  closeMenu(e) {
    if (e == 'close' || e.target.id == 'wrapper') {
      let animation = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease',
      })

      animation.backgroundColor('transparent').step()
      animation.translateX('-100%').opacity(0).step()
      this.setData({
        animationData: animation.export(),
        hidden: false
      })
    }
  },

  //menu 图片
  menuImg() {
    let now = new Date()
    let month = parseInt(now.getMonth()) + 1
    let imgSrc
    if (month == 12 || month < 2) {
      imgSrc = '/img/dong.jpg'
    } else if (month >= 3 && month < 6) {
      imgSrc = '/img/chun.jpg'
    } else if (month >= 6 && month < 9) {
      imgSrc = '/img/xia.jpg'
    } else {
      imgSrc = '/img/qiu.jpg'
    }
    this.setData({
      imgSrc: imgSrc
    })
  },

  // 城市管理
  addCity() {
    let addr = JSON.stringify(this.data.addr)
    wx.navigateTo({
      url: '/pages/city/city?addr=' + addr,
    })
  },

  // 设置
  setting() {
    wx.navigateTo({
      url: '/pages/setting/setting'
    })
  },

  // 关于
  about() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  }
})