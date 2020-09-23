const axios = require('axios')

const okList = []

let whitelist
try {
  // You can write a whitelist in `@/data/whitelist.js`.
  // Example: `module.exports = ['example@example.com', ...]`
  whitelist = require('../../data/whitelist')
} catch (e) {
  // Default DISALLOW EVERYONE.
  whitelist = []
}

async function getGitHubEmails(token) {
  const response = await axios.get('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return response.data
}

// eslint-disable-next-line space-before-function-paren
module.exports = async (req) => {
  if (whitelist.length > 0) {
    const token = req.token
    if (token) {
      if (okList.includes(token)) {
        return true
      } else {
        const userEmails = await getGitHubEmails(token)
        for (const email of userEmails) {
          if (email.verified === true && whitelist.includes(email.email)) {
            okList.push(token)
            return true
          }
        }
      }
    }
  }
  return false
}
