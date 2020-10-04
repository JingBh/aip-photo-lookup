const md5 = require('md5')
const storage = require('node-persist')
const tinify = require('tinify')
tinify.key = process.env.TINIFY_KEY || ''

module.exports = (req) => {
  const result = [false, '', null]

  let image = req.body.image || ''
  if (image.substring(0, 5) === 'data:') {
    const urlHead = image.substring(0, image.indexOf(',') + 1)
    image = image.substring(image.indexOf(',') + 1)

    return new Promise((resolve) => {
      const hash = md5(image) + 'COMPRESS'
      storage.getItem(hash).then((cache) => {
        if (cache) {
          resolve(cache)
        } else {
          tinify.fromBuffer(Buffer.from(image, 'base64')).resize({
            method: 'fit',
            width: 2000,
            height: 2000
          }).toBuffer((error, response) => {
            if (error) {
              result[1] = error.message
            } else {
              result[0] = true
              result[2] = urlHead + response.toString('base64')
            }
            storage.setItem(hash, result)
            resolve(result)
          })
        }
      })
    })
  } else {
    result[1] = '请求不合法'
    return Promise.resolve(result)
  }
}
