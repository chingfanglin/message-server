
var user = require('../server/user')
var friends = require('../server/friends')
const bcrypt = require('bcrypt')
const config = require('../config/config')

/**
 * GET
 * Public API
 * Get User By Id
 **/
exports.getUser = async (req, res) => {
  try {
    // $2b$10$OYfK2on4RdrG9VU0Yq6giOLAnUz.YROOVcfL5rthoBJN8bXse9qE6
    const secret_key = config.SECRET_KEY;

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(secret_key, salt);
    
    const authorization = req.headers.authorization || ''
    const status = bcrypt.compareSync(secret_key, authorization)
    
    console.log(`Hash Code : ${hash}`)
    if (!status) return res.json('authorization')

    const username = req.params.username

    user.getUserById(username, function (err, user) {
      if (err) {
        res.json(err)
      }
      res.json(user)
    });

  } catch (err) {
    return res.json(err)
  }
}


/**
 * POST
 * Public API
 * Add Friends
 **/
exports.addFriends = async (req, res) => {
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

    const from_user_id = req.body.from_user_id
    const to_user_id = req.body.to_user_id

    friends.addFriends(from_user_id, to_user_id, token, function (err, user) {
      if (err) {
        res.json(err)
      }
      res.json(user)
    });

  } catch (err) {
    return res.json(err)
  }
}

/**
 * POST
 * Public API
 * Del Friends
 **/
exports.delFriends = async (req, res) => {
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

    const from_user_id = req.body.from_user_id
    const to_user_id = req.body.to_user_id

    friends.delFriends(from_user_id, to_user_id, token, function (err, user) {
      if (err) {
        res.json(err)
      }
      res.json(user)
    });

  } catch (err) {
    return res.json(err)
  }
}


/**
 * POST
 * Public API
 * Agree Friends
 **/
exports.agreeFriends = async (req, res) => {
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

    const user_id = req.body.user_id
    const friends_id = req.body.friends_id

    friends.agreeFriends(user_id, friends_id, token, function (err, user) {
      if (err) {
        res.json(err)
      }
      res.json(user)
    });

  } catch (err) {
    return res.json(err)
  }
}

/**
 * POST
 * Public API
 * Block Friends
 **/
exports.blockFriends = async (req, res) => {
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

    const user_id = req.body.user_id
    const friends_id = req.body.friends_id

    friends.blockFriends(user_id, friends_id, token, function (err, user) {
      if (err) {
        res.json(err)
      }
      res.json(user)
    });

  } catch (err) {
    return res.json(err)
  }
}


