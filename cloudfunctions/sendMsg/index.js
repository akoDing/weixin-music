// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    OPENID
  } = cloud.getWXContext()
  const result = await cloud.openapi.subscribeMessage.send({
    touser: OPENID,
    page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data: {
      phrase1: {
        value: "评论完成"
      },
      thing2: {
        value: event.content
      }
    },
    templateId: 'Rv_rUsqT7bew3e7uUM_8FtbcODFVEcf_ShUz80RekSc',
    // formId: event.formId
  })
  return result
}