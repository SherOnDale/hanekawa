const axios = require('axios');
const cheerio = require('cheerio');
const Discord = require('discord.js');
const mongoService = require('../services/mongo');
const config = require('../config');

console.log(config)

module.exports = class Crawler {
  constructor() {
    this.stop = false
  }

  start(client, limit=0) {
    this.logChannel = client.channels.cache.get(config.logChannel)
    console.log('On page ' + ((limit / 50) + 1))
    axios.get(`https://myanimelist.net/character.php?limit=${limit}`).then((response) => {
      const $ = cheerio.load(response.data)
      const urls = []
      $('.ranking-list td.people .information a').each((index, el) => {
        urls.push(el.attribs['href'])
      })
      Promise.all(urls.map(url => axios.get(encodeURI(url))))
        .then(response => {
          response.forEach(res => {
            const $ = cheerio.load(res.data)
            const tempContent = {}
            tempContent.name = $('#content .normal_header').eq(2).text()
            tempContent.imageUrl = $('#content a[href$="pictures"] img').eq(0).attr('data-src')
            tempContent.malUrl = 'https://myanimelist.net' + res.request.path
            $('#content td[valign="top"][style="padding-left: 5px;"] div').remove()
            $('#content td[valign="top"][style="padding-left: 5px;"] table').remove()
            $('#content td[valign="top"][style="padding-left: 5px;"] h2').remove()
            tempContent.additionalInfo = $('#content td[valign="top"][style="padding-left: 5px;"]').text().replace(/(\s)*/g, '$1').trim()
            tempContent.from = $('#content table td>a').eq(0).text().trim()
            if(!tempContent.additionalInfo) tempContent.additionalInfo = 'N/A'
            const msgEmbed = new Discord.MessageEmbed()
              .setTitle(tempContent.name + ' added!')
              .setColor('#00ff00')
              .setThumbnail(tempContent.imageUrl)
              .addFields(
                {name: "From", value: (tempContent.from? tempContent.from: 'N/A')},
                {name: 'MAL URL', value: tempContent.malUrl},
                {name: 'Additional Information', value: tempContent.additionalInfo? (tempContent.additionalInfo.slice(0, 1000) + (tempContent.additionalInfo.length > 1000? '...' : '')): 'N/A'}
              )
            mongoService
                .getClient()
                .db()
                .collection('characters')
                .findOne({malUrl: tempContent.malUrl})
                .then(result => {
                  console.log('here')
                  if(!result) {
                    mongoService
                      .getClient()
                      .db()
                      .collection('characters')
                      .insertOne(tempContent)
                      .then(() => {
                        console.log('here three')
                        this.logChannel.send(msgEmbed)
                      })
                      .catch((error) => {
                        console.log('here two')
                        msgEmbed.setColor('#ff0000')
                        msgEmbed.setTitle('Failed to add ' + tempContent.name)
                        this.logChannel.send(msgEmbed)
                          .catch((err) => {
                          if(!this.stop) {
                            setTimeout(() => {
                              process.nextTick(this.start.bind(this, client, limit))
                            }, 0)
                          }
                        })
                        if(!this.stop) {
                          setTimeout(() => {
                            process.nextTick(this.start.bind(this, client, limit))
                          }, 0)
                        }
                      })
                  }
                })
                .catch((error) => {
                  msgEmbed.setColor('#ff0000')
                  msgEmbed.setTitle('Failed to add ' + tempContent.name)
                  this.logChannel.send(msgEmbed)
                    .catch(err => {
                    if(!this.stop) {
                      setTimeout(() => {
                        process.nextTick(this.start.bind(this, client, limit))
                      }, 0)
                    }
                  })
                  if(!this.stop) {
                    setTimeout(() => {
                      process.nextTick(this.start.bind(this, client, limit))
                    }, 0)
                  }
                })
          })
            
          if(!this.stop) {
            setTimeout(() => {
              process.nextTick(this.start.bind(this, client, limit + 50))
            }, 0)
          }
        })
        .catch((err) => {  
          if(!this.stop) {
            setTimeout(() => {
              process.nextTick(this.start.bind(this, client, limit))
            }, 0)
          }
        })
    })
    .catch(() => {
      console.log('403 error, restarting in 5 mins')
      if(!this.stop) {
        setTimeout(() => {
          process.nextTick(this.start.bind(this, client, limit))
        }, 1000 * 60 * 5)
      }
    })
  }

  stopExecution() {
    this.stop = true
  }
}
