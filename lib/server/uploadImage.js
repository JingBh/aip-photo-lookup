const md5 = require('md5')
const storage = require('node-persist')

module.exports = async (client, req) => {
  let image = req.body.image || ''
  if (image.substring(0, 5) === 'data:') {
    image = image.substring(image.indexOf(',') + 1)
  }
  const type = req.body.type || 'BASE64'
  const groups = (req.body.groups || []).join(',')

  const hash = md5(image) + type + groups
  const cache = await storage.getItem(hash)

  if (cache) {
    return cache
  } else {
    const result = await client.multiSearch(image, type, groups, {
      match_threshold: 75,
      max_face_num: 10,
      max_user_num: 1
    })
    await storage.setItem(hash, result, {
      ttl: 1000 * 60 * 60 * 24 // One day
    })
    return result
  }
}
