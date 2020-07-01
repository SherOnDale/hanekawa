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

    if(command === 'start') {
      crawler.start(client)
    } 
    if(command === 'stop') {
      message.reply('Stopped')
      crawler.stopExecution()
    }
    if(command.startsWith('resume')) {
      const pageNumber = Number(command.split(' ')[1])
      if(Number.isFinite(pageNumber)) {
        const limit = (pageNumber -1) * 50 
        crawler.start(client, limit)
      }
      
    }

}
