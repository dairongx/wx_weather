//index.js
//获取应用实例
const bmap = require('../../libs/bmap-wx.js')
const app = getApp()

Page({
  data: {
    weatherData: [],  // 天气数据
    weatherList: [],
    addr: [],     // 所以地址
    bg: [],        // 背景
    location: [],   
    current: 0,
    ptTitle: ['icon-chuanyizhishu', 'icon-xichezhishu', 'icon-ganmaozhishu', 'icon-yundongzhishu', 'icon-fangshaizhishu'],
    show: true,
    animationData: {},
    imgSrc: '',
    hidden: false,
    search: false,
    SWeather: false,
    city: '',
    searchData: '',
    searchBg: '',
    
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
    that.getSearchList()
  },

  onHide() {
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
              return (that.mapWeather(item).then(data => {
                data.res.time = new Date().toTimeString().slice(0, 5)
                data.res.temperature = data.res.currentWeather[0].date.split('：')[1].split(')')[0]
                data.res.location = data.location;
                that.setData({
                  weatherList: that.data.weatherList.concat(data.res),
                })
              }))
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
    return new Promise((resolve, reject) => {
      BMap.weather({
        location: location,
        fail: function(data) {
          reject(data)
        },
        success: function(res) {
          let data = {
            res: res,
            location: location
          }
          resolve(data)
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
    } else if (pm < 100) {
      return '良'
    } else if (pm < 150) {
      return '轻度污染'
    } else if (pm < 200) {
      return '中度污染'
    } else if (pm < 300) {
      return '重度污染'
    } else if (pm > 300) {
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

    that.mapWeather(location[current]).then(data => {
      data.res.time = new Date().toTimeString().slice(0, 5)
      data.res.temperature = data.res.currentWeather[0].date.split('：')[1].split(')')[0]
      data.res.location = data.location;
      let pm25 = data.res.currentWeather[0].pm25
      data.res.currentWeather[0].pm25 = that.pm25(pm25) + pm25
      weatherData.splice(current, 1, data.res)
      bg.splice(current, 1, that.bgChange(data.res.currentWeather[0].weatherDesc))
      that.setData({
        weatherData: weatherData,
        bg: bg
      })
      wx.stopPullDownRefresh()
    })
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
  },

  // 显示search input
  showSearch() {
    this.setData({
      search: true
    })
  },

  // 隐藏search input
  hideSearch() {
    this.setData({
      search: false
    })
  },

  // input 输入
  inputCity(e) {
    let that = this
    let reg = new RegExp('^[\u4E00-\u9FA5]+$')
    let city = e.detail.value
    if (!city.trim()) return
    if (reg.test(city)) {
      this.setData({
        city: e.detail.value
      })
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

  // 搜索
  searchCity() {
    let that = this
    let city = that.data.city
    if (city) {
      app.getGeocoder(city).then(location => {
        if (location) {
          that.mapWeather().then(data=>{
            data.res.time = new Date().toTimeString().slice(0, 5)
            data.res.temperature = data.res.currentWeather[0].date.split('：')[1].split(')')[0]
            let pm25 = data.res.currentWeather[0].pm25
            data.res.currentWeather[0].pm25 = that.pm25(pm25) + pm25
            let bg = that.bgChange(data.res.currentWeather[0].weatherDesc)
            that.setData({
              searchData: data.res,
              searchBg: bg,
              SWeather: true,
              search: false
            })
          })
          that.search(city)
        }
      }).catch(err => {
        console.log(err)
        wx.showToast({
          title: '错误的地名',
          icon: 'none',
          duration: 1500
        })
      })
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

  // 添加搜索记录
  search(city) {
    wx.getStorage({
      key: 'search',
      success: function(res) {
        let citys = res.data
        if (citys[city]) {
          citys[city].count++
        } else {
          citys[city] = {
            count: 1
          }
        }
        wx.setStorage({
          key: 'search',
          data: citys,
        })
      },
      fail: function() {
        wx.setStorage({
          key: 'search',
          data: {
            [city]: {
              count: 1
            }
          },
        })
      }
    })
  },

  // 获取搜索记录,并按搜索次数进行排序
  getSearchList() {
    let that = this;
    wx.getStorage({
      key: 'search',
      success: function(res) {
        if (res.data) {
          let list = []
          for (let i in res.data) {
            list.push({
              name: i,
              count: res.data[i].count
            })
          }
          list = list.sort((a, b) => b.count - a.count)
          that.setData({
            searchList: list
          })
        }
      },
      fail: function(err) {
        that.setData({
          searchList: []
        })
      }
    })
  },

  // 点击搜索记录
  chooseCity(e) {
    let city = e.currentTarget.dataset.name
    this.setData({
      city: city
    })
  },

  // 清除历史记录
  clear() {
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定清除历史记录',
      success: function(res) {
        if (res.confirm) {
          wx.removeStorage({
            key: 'search',
            success: function() {
              that.setData({
                searchList: []
              })
            }
          })
        }
      }
    })
  },

  //
  back(){
    this.setData({
      SWeather: false,
      search: false,
      city: '',
      searchBg: ''
    })
  }
})