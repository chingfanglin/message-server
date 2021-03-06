
const database = require('../server/database');

exports.joinChannel = function (channelName, users, callback) {
  database.joinChannel(channelName, users, function (err, channelID) {
    if (err) {
      callback(err)
    }
    callback(null, channelID)
  })
}

exports.getUserChannel = function (user_id, callback) {
  database.getUserChannel(user_id, function (err, channel) {
    if (err) {
      callback(err)
    }
    callback(null, channel)
  })
}

exports.getUserChat = function (user_id, channel_id, callback) {
  database.getUserChat(user_id, channel_id, function (err, channel) {
    if (err) {
      callback(err)
    }
    callback(null, channel)
  })
}