// pages/blog-edit/blog-edit.js
const MAX_WORDS = 140
const MAX_IMG = 9
// 初始化数据库
const db = wx.cloud.database()
// 输入的内容
let content = ''
let userInfo = {}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: 0,
    fotterBottom: 0,
    images: [],
    selectPhoto: true
  },

  onInput(e) {
    let wordsNum = e.detail.value.length
    if (wordsNum >= MAX_WORDS) {
      wordsNum = `最大字数为${MAX_WORDS}`
    }
    this.setData({
      wordsNum
    })
    content = e.detail.value
  },
  onFocus(e) {
    this.setData({
      // 模拟器获取的键盘高度为0
      footerBottom: e.detail.height
    })
  },
  onBlur(e) {
    this.setData({
      footerBottom: 0
    })
  },
  onChooseImage() {
    // 还能再选几张图片
    let max = MAX_IMG - this.data.images.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res)
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        max = MAX_IMG - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      }
    })
  },
  onDelImg(e) {
    this.data.images.splice(e.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    if (this.data.images.length == MAX_IMG - 1) {
      this.setData({
        selectPhoto: true
      })
    }
  },
  onPreviewImg(e) {
    // 6 / 5
    wx.previewImage({
      urls: this.data.images,
      current: e.target.dataset.imgsrc
    })
  },
  send() {
    if (content.trim() === '') {
      wx.showModal({
        title: '请输入内容',
        content: ''
      })
      return
    }

    wx.showLoading({
      title: '发布中',
      mask: true
    })
    // 数据存储到云数据库
    // 数据库 内容 图片
    // 图片 云存储
    // 图片上传
    let promiseArr = []
    let fileIds = []
    for (let i = 0, len = this.data.images.length; i < len; i++) {
      let p = new Promise((resolve, reject) => {
        let item = this.data.images[i]
        // 文件拓展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 10000000 + suffix,
          filePath: item,
          success: (res) => {
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    // 存入数据库,保证所有图片都存储成功
    Promise.all(promiseArr).then((res) => {
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          img: fileIds,
          createTime: db.serverDate() // 服务端的时间
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功'
        })
        // 返回
        wx.navigateBack()
        // 获取当前页面栈
        const pages = getCurrentPages()
        // 取到上一个页面
        const prevPage = pages[pages.length - 2]
        prevPage.onPullDownRefresh()
      })

    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败'
      })
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    userInfo = options
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})