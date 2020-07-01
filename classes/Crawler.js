const axios = require('axios');
const cheerio = require('cheerio');

module.exports = class Crawler {
  constructor() {
    this.stop = false
  }

  start(client, limit=0) {
    console.log('on page ' + ((limit / 50) + 1))
    this.logChannel = client.channels.cache.get('593610953363554314')
    axios.get(`https://myanimelist.net/character.php?limit=${limit}`).then((response) => {
      const $ = cheerio.load(response.data)
      const urls = []
      $('.ranking-list td.people .information a').each((index, el) => {
        urls.push(el.attribs['href'])
      })
      console.log(urls)
      Promise.all(urls.map(url => axios.get(url)))
        .then(response => {
          const content = response.map(res => {
            const $ = cheerio.load(res.data)
            return $('#content').text()
          })
          this.logChannel.send('running')
  
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
