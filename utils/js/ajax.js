let api_url = 'https://c.y.qq.com/music/test/'
export default{
  get(url, data){
    return new Promise((resolve, reject)=>{
      wx.request({
        url: api_url + url,
        method: 'GET',
        data,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          resolve(res.data)
        },
        error(err){
          reject(err)
        }
      })
    })
  },
  post(url, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: api_url + url,
        method: 'POST',
        data,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          resolve(res.data)
        },
        error(err) {
          reject(err)
        }
      })
    })
  }
}