const express = require('express')

const storage = require('node-persist')
const bearerToken = require('express-bearer-token')
const cookieParser = require('cookie-parser')

const checkAccess = require('./checkAccess')
const getGroups = require('./getGroups')
const uploadImage = require('./uploadImage')

const aipClient = require('./baiduAip')()

const app = express()

app.use(express.json({ limit: '3mb' }))
app.use(bearerToken())
app.use(cookieParser())
storage.init()

app.get('/check_access', (req, res) => {
  checkAccess(req).then(result => res.json(result))
})

app.get('/groups', (req, res) => {
  checkAccess(req).then((result) => {
    if (result) {
      getGroups(aipClient, req).then(result => res.json(result))
    } else {
      res.status(401).end()
    }
  })
})

app.post('/upload_image', (req, res) => {
  checkAccess(req).then((result) => {
    if (result) {
      uploadImage(aipClient, req).then(result => res.json(result))
    } else {
      res.status(401).end()
    }
  })
})

module.exports = {
  path: '/api',
  handler: app
}
