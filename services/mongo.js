const mongodb = require('mongodb');
const config = require('../config');

const { MongoClient } = mongodb;
let client;

const initClient = (callback) => {
  if (client) {
    return callback(null);
  }

  MongoClient.connect(config.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then((db) => {
      client = db;
      callback(null);
    })
    .catch((err) => {
      callback(err);
    });
};

const getClient = () => {
  if (!client) {
    throw new Error('Failed to initialize monogdb client');
  }
  return client;
};

module.exports = { initClient, getClient };
