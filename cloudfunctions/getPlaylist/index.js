// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const rp = require('request-promise')

const URL = "http://musicapi.xiecheng.live/personalized"

const playlistCollection = db.collection('playlist')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  // 一次只能拿去100条数据
  // const list = await playlistCollection.get()
  const countResult = await playlistCollection.count() //获取数据条数对象
  const total = countResult.total //获取数据条数
  const batchTimes = Math.ceil(total / MAX_LIMIT)  //向上取整（一次最多去100条，可以取几次）
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if(tasks.length > 0) {
    // reduce(acc-计算后返回值，cur-当前元素)累加器
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })
  console.log(playlist);

  // 去重处理
  const newData = []
  for(let i = 0, len1 = playlist.length; i < len1; i++) {
    let flag = true
    for(let j = 0, len2 = list.data.length; j < len2; j++) {
      if(playlist[i].id === list.data[j].id) {
        flag = false
        break
      }
    }
    if(flag) {
      newData.push(playlist[i])
    }
  }

  for (let i = 0, len = newData.length; i< len; i++) {
    await playlistCollection.add({
      data: {
        ...newData[i],
        createTime: db.serverDate(),
      }
    }).then((res) => {
      console.log.log('插入成功')
    }).catch((err) => {
      console.log('插入失败')
    })

  }

  return newData.length

}