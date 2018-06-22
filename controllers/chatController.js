

var chat = require('../server/chat');
const bcrypt = require('bcrypt')
const config = require('../config/config')

/**
 * POST
 * Public API
 * send Message
 **/

exports.sendMessage = async (req, res) => {
  try {
    // $2b$10$OYfK2on4RdrG9VU0Yq6giOLAnUz.YROOVcfL5rthoBJN8bXse9qE6
    const secret_key = config.SECRET_KEY;

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(secret_key, salt);

    const authorization = req.headers.authorization || ''
    const token = req.headers.token || ''
    const status = bcrypt.compareSync(secret_key, authorization)

    console.log(`Hash Code : ${hash}`)
    if (!status) return res.json('authorization')
    if (!token) return res.json('token')

    const channel = req.body.channel
    const message = req.body.message
    const user_id = req.body.user_id

    chat.sendMessage(user_id, token, channel, message, function (err, chat_id) {
      if (err) {
        res.json(err)
      }
      res.json(chat_id)
    });

  } catch (err) {
    return res.json(err)
  }
}