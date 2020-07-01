if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

module.exports = {
  botToken: process.env.BOT_TOKEN || '',
  prefix: process.env.PREFIX || '~',
  mongoUrl: process.env.MONGO_URL || ''
}
