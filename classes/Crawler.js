const axios = require('axios');
const cheerio = require('cheerio');
const Discord = require('discord.js');

module.exports = class Crawler {
  constructor() {
    this.stop = false
  }

  start(client, limit=0) {
    this.logChannel = client.channels.cache.get('593610953363554314')
    this.logChannel.send('On page ' + ((limit / 50) + 1))
    console.log('On page ' + ((limit / 50) + 1))
    axios.get(`https://myanimelist.net/character.php?limit=${limit}`).then((response) => {
      const $ = cheerio.load(response.data)
      const urls = []
      $('.ranking-list td.people .information a').each((index, el) => {
        urls.push(el.attribs['href'])
      })
      Promise.all(urls.map(url => axios.get(url)))
        .then(response => {
          const content = response.map(res => {
            const $ = cheerio.load(res.data)
            const tempContent = {}
            tempContent.name = $('#content .normal_header').eq(2).text()
            tempContent.imageUrl = $('#content a[href$="pictures"] img').eq(0).attr('data-src')
            tempContent.malUrl = 'https://myanimelist.net' + res.request.path
            $('#content td[valign="top"][style="padding-left: 5px;"] div').remove()
            $('#content td[valign="top"][style="padding-left: 5px;"] table').remove()
            $('#content td[valign="top"][style="padding-left: 5px;"] h2').remove()
            tempContent.additionalInfo = $('#content td[valign="top"][style="padding-left: 5px;"]').text().replace(/(\s)*/g, '$1')
            const msgEmbed = new Discord.MessageEmbed()
              .setTitle(tempContent.name + ' added!')
              .setThumbnail(tempContent.imageUrl)
              .addFields(
                {name: 'MAL URL', value: tempContent.malUrl},
                {name: 'Additional Information', value: tempContent.additionalInfo.slice(0, 1000) + (tempContent.additionalInfo.length > 1000? '...' : '')}
              )
            this.logChannel.send(msgEmbed)
            return tempContent
          })
            
          if(!this.stop) {
            setTimeout(() => {
              process.nextTick(this.start.bind(this, client, limit + 50))
            }, 0)
          } else {
            console.log('stopped')
          }
        })
        .catch(() => {
  
          if(!this.stop) {
            setTimeout(() => {
              process.nextTick(this.start.bind(this, client, limit))
            }, 0)
          } else {
            console.log('stopped')
          }

        })
    })
  }

  stopExecution() {
    this.stop = true
  }
}
