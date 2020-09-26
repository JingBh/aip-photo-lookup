const AipFaceClient = require('baidu-aip-sdk').face

module.exports = function getAipClient() {
  // 可以通过环境变量指定 APP_ID、API_KEY、SECRET_KEY
  const appId = process.env.AIP_APP_ID
  const apiKey = process.env.AIP_API_KEY
  const secretKey = process.env.AIP_SECRET_KEY

  return new AipFaceClient(appId, apiKey, secretKey)
}
