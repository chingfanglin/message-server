
const database = require('../server/database');

exports.sendMessage = function (user_id, token, channel, message, callback) {
  database.sendMessage(user_id, token, channel, message, function (err, chat_id) {
    if (err) {
      callback(err)
    }
    callback(null, chat_id)
  })
}