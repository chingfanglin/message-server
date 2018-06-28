const database = require('../server/database')

exports.createUser = (username, password, email, callback) => {
  database.createUser(username, password, email, function(err, data) {
    if (err) {
      if (err.code === '23505') callback('user-name-taken')
      else callback(err)
    }
    callback(null, data)
  })
}

exports.login = function(username, password, callback) {
  database.login(username, password, function(err, token) {
    if (err) {
      if (err.code === '23505') return callback('user-name-taken')
      else return callback(err)
    }
    return callback(null, token)
  })
}

exports.getUserById = function(username, callback) {
  database.getUserById(username, function(err, user) {
    if (err) {
      callback(err)
    }
    callback(null, user)
  })
}
