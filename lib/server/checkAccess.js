const axios = require('axios')
const storage = require('node-persist')

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
      Authorization: token
    }
  })

  return response.data
}

module.exports = async (req) => {
  if (whitelist.length > 0) {
    const token = req.token ? `Bearer ${req.token}` : req.cookies['auth._token.github']
    if (token) {
      if (await storage.getItem(`'auth._token.${token}.ok`)) {
        return true
      } else {
        try {
          const userEmails = await getGitHubEmails(token)
          for (const email of userEmails) {
            if (email.verified === true && whitelist.includes(email.email)) {
              await storage.setItem(`'auth._token.${token}.ok`, true, {
                ttl: 1000 * 60 * 60 * 24 * 7 // One week
              })
              return true
            }
          }
        } catch (e) {
          console.error(e.message)
        }
      }
    }
  }
  return false
}
