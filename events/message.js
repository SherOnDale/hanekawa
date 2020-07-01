const config = require('../config')
const Crawler = require('../classes/Crawler')

const crawler = new Crawler();

module.exports = async (client, message) => {
  if(message.author.bot) return;

  if(message.content.indexOf(config.prefix) !== 0) return;

  const command = message
    .content
    .slice(config.prefix.length)
    .trim()
    .toLowerCase()

    message.reply(command)

    if(command === 'start') {
      crawler.start(client)
    } 
    if(command === 'stop') {
      message.reply('stopped')
      crawler.stopExecution()
    }
}
