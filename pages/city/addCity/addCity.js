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
    this.getSearchList()
  },

  onUnload() {
    getCurrentPages()[1].add(this.data.addr)
  },

  // 将城市名转换成坐标
  getGeocoder(addr) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.map.baidu.com/geocoder/v2/?address=${addr}&output=json&ak=${app.globalData.ak}`,
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
      that.getGeocoder(city).then(location => {
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
                that.search(city)
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
  chooseCity(e){
    let city = e.currentTarget.dataset.name
    this.setData({
      city: city
    })
  },

  // 清除历史记录
  clear(){
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定清除历史记录',
      success:function(res){
        if(res.confirm){
          wx.removeStorage({
            key: 'search',
            success: function () {
              that.setData({
                searchList: []
              })
            }
          })
        }
      }
    })
  }
})