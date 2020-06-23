// pages/playlists/playlists.js
const MAX_LIMIT = 15
//小程序端初始化云数据库
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: "",
   /*  swiperImgUrls: [{
        url: 'http://p1.music.126.net/MXPbYXSuv_AI_ESL4YibYg==/109951164997638379.jpg?imageView&quality=89'
      },
      {
        url: 'http://p1.music.126.net/9Iqc5TIrB95jp3QdLe3Xxw==/109951164997254694.jpg?imageView&quality=89'
      },
      {
        url: 'http://p1.music.126.net/eg4Ny7urZ5RnWOZOsFw0mg==/109951164997278406.jpg?imageView&quality=89'
      }
    ], */
    swiperImgUrls: [],
    playlist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getPlayList()
    this._getListBanner()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      playlist: []
    })
    this._getPlayList()
    this._getListBanner()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getPlayList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //从小程序端查询数据库
  _getListBanner() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    db.collection('swiper').get()
      .then(res => {
        console.log(res)
        this.setData({
          swiperImgUrls: res.data
        })
        wx.hideLoading()
      })
  },

  /**
   * 获取歌单列表
   */
  _getPlayList: function () {
    wx.showLoading({
      title: '加载中...'
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        $url: 'playlist',
        start: this.data.playlist.length,
        count: MAX_LIMIT
      }
    }).then((res) => {
      this.setData({
        playlist: this.data.playlist.concat(res.result.data)
      })
      // 当数据请求成功之后停止下拉刷新的动作
      wx.stopPullDownRefresh()
      wx.hideLoading()
    })
  }
})