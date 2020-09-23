const express = require('express')

const storage = require('node-persist')
const bearerToken = require('express-bearer-token')

const checkAccess = require('./checkAccess')

const app = express()

app.use(express.json())
app.use(bearerToken())
storage.init()

// eslint-disable-next-line space-before-function-paren
app.get('/check_access', async (req, res) => {
  const result = await checkAccess(req)
  res.json(result)
})

module.exports = {
  path: '/api',
  handler: app
}
