
var user = require('../server/user');
const bcrypt = require('bcrypt')
const config = require('../config/config')

exports.login = async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  try {
    user.login(username, password, function (err, token) {
      if (err) {
        res.json(err)
      }
      res.json(token)
    });
  } catch (err) {
    return res.json(err)
  }
}

/**
 * POST
 * Public API
 * Create new User
 **/

exports.createUser = async (req, res) => {
  try {
    // FJDIOdf1f4dKhPkQazck58olRjiPRcG $2b$10$1MZmWbp7c6oNVFAQh1Od0eWMCINFM7qixl14Z5zVFhpkgy4FYfgEO
    const secret_key = config.SECRET_KEY;
    const authorization = req.headers.authorization
    const status = bcrypt.compareSync(secret_key, authorization)

    if (!status) return res.json(xhrErrors('authorization'))

    const username = req.body.username
    const password = req.body.password
    const email = req.body.email

    user.createUser(username, password, email, function (err, userId) {
      if (err) {
        res.json(err)
      }
      res.json(userId)
    });

  } catch (err) {
    return res.json(err)
  }
}