const database = require('../server/database');

exports.addFriends = function (from_user_id, to_user_id, token, callback) {
  database.addFriends(from_user_id, to_user_id, token, function (err, chat_id) {
    if (err) {
      callback(err)
    }
    callback(null, chat_id)
  })
}

exports.delFriends = function (from_user_id, to_user_id, token, callback) {
  database.delFriends(from_user_id, to_user_id, token, function (err, chat_id) {
    if (err) {
      callback(err)
    }
    callback(null, chat_id)
  })
}

exports.agreeFriends = function (user_id, friends_id, token, callback) {
  database.agreeFriends(user_id, friends_id, token, function (err, id) {
    if (err) {
      callback(err)
    }
    callback(null, id)
  })
}

exports.blockFriends = function (user_id, friends_id, token, callback) {
  database.blockFriends(user_id, friends_id, token, function (err, id) {
    if (err) {
      callback(err)
    }
    callback(null, id)
  })
}