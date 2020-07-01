const config = require('../config')

module.exports = async (client, message) => {
  if(message.author.bot) return;

  if(message.content.indexOf(config.prefix) !== 0) return;

  const command = message
    .content
    .slice(config.prefix)
    .trim()
    .toLowerCase()
  
  message.reply(command)
}
