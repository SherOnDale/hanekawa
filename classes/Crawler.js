module.exports = class Crawler {
  constructor() {
    this.stop = false
  }

  start(client) {
    this.logChannel = client.channels.cache.get('593610953363554314')
    console.log('running', this.stop)
    this.logChannel.send('running')

    if(!this.stop) {
      setTimeout(() => {
        process.nextTick(this.start.bind(this, client))
      }, 3000)
    } else {
      console.log('stopped')
    }
  }

  stopExecution() {
    this.stop = true
  }
}
