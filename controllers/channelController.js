var channel = require('../server/channel');
const bcrypt = require('bcrypt')
const config = require('../config/config')

/**
 * POST
 * Public API
 * join Channel
 **/
exports.joinChannel = async (req, res) => {
  try {
    // $2b$10$OYfK2on4RdrG9VU0Yq6giOLAnUz.YROOVcfL5rthoBJN8bXse9qE6
    const secret_key = config.SECRET_KEY;

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(secret_key, salt);

    const authorization = req.headers.authorization || ''
    const status = bcrypt.compareSync(secret_key, authorization)

    console.log(`Hash Code : ${hash}`)
    if (!status) return res.json('authorization')

    const channelName = req.body.channelName
    const users = req.body.users
    
    channel.joinChannel(channelName, users, function (err, channel) {
      if (err) {
        res.json(err)
      }
      res.json(channel)
    });

  } catch (err) {
    return res.json(err)
  }
}