const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config')

const events = ['ready', 'message']

events.forEach(event => {
  const eventHandler = require(`./events/${event}`)
  client.on(event, eventHandler.bind(null, client))
})

client.login(config.botToken)
