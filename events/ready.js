const mongoService = require('../services/mongo')

module.exports = async client => {
  console.log(`Logged in as ${client.user.tag}`)
  mongoService.initClient(() => {
    console.log('Connected to the database')
  })
}
