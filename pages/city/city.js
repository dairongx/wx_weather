// pages/addCity/addCity.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addr: [],
    translateX: 0,
    listIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      addr: JSON.parse(options.addr)
    })
  },

  add(addr) {
    this.setData({
      addr: addr
    })
  },

  // 删除
  delcity(e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let addr = that.data.addr
    if (index == 0) return 0
    wx.showModal({
      title: '提示',
      content: '确定删除吗',
      success: function(res) {
        if (res.confirm) {
          wx.getStorage({
            key: 'location',
            success: function(data) {
              if (data.data.length > 1) {
                let location = data.data
                location.splice(index, 1)
                wx.setStorage({
                  key: 'location',
                  data: location,
                })
                addr.splice(index, 1)
                that.setData({
                  addr: addr
                })
              }
            },
          })
        }
      }
    })
  },

  // 添加
  addcity() {
    let addr = JSON.stringify(this.data.addr)
    wx.navigateTo({
      url: '/pages/city/addCity/addCity?addr=' + addr,
    })
  },

  touchStart(e) {
    let index = e.currentTarget.dataset.index
    this.startX = e.touches[0].pageX
    this.startY = e.touches[0].pageY
    this.setData({
      listIndex: index,
      translateX: 0
    })
  },

  touchMove(e) {
    this.moveX = e.touches[0].pageX
    this.moveY = e.touches[0].pageY
    let x = this.startX - this.moveX
    let y = this.startY - this.moveY
    if (x > 0 && y < 100) {
      if (x >= 80) {
        this.setData({
          translateX: 80
        })
      } else {
        this.setData({
          translateX: x
        })
      }
    }
  },

  touchEnd() {
    let x = this.startX - this.moveX
    let y = this.startY - this.moveY
    if (x > 60 && y < 100) {
      this.setData({
        translateX: 80
      })
    } else {
      this.setData({
        translateX: 0
      })
    }
  },

  touchCancel() {
    this.setData({
      translateX: 0,
      listIndex: ''
    })
  },

  cancel() {
    this.setData({
      translateX: 0,
      listIndex: ''
    })
  },

  touchcancel(e){
    if (e.target.id !='list'){
      this.setData({
        translateX: 0,
        listIndex: ''
      })
    }
  }
})