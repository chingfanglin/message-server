var user = require('../server/user')
const QRCode = require('qrcode')
const bcrypt = require('bcrypt')
const config = require('../config/config')
const jwt = require('jsonwebtoken')
const speakeasy = require('speakeasy')

exports.login = async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  try {
    user.login(username, password, function(err, {token, isShowQR}) {
      const data = {
        msg: err,
        token: token,
        isShowQR: isShowQR,
        status: token !== void 0 ? 200 : 401
      }
      return res.json(data)
    })
  } catch (err) {
    console.log(err)
    const data = {
      msg: err,
      status: 401
    }
    return res.json(data)
  }
}

exports.createSecretQRCode = async (req, res) => {
  const secret_key = config.SECRET_KEY
  const authorization = req.headers.authorization || ''
  if (!authorization) return res.json('unauthorized')

  try {
    decoded = jwt.verify(authorization, secret_key)
  } catch (e) {
    return res.status(401).send('unauthorized')
  }
  userInfo = jwt.verify(authorization, secret_key)
  const otpauth_url = userInfo.otpauth_url
  QRCode.toDataURL(otpauth_url, function(err, data_url) {
    const data = {
      msg: err,
      data_url: `${data_url}`,
      status: 200
    } 
    return res.json(data)
  })
}

/**
 * POST
 * Public API
 * Create Secret QRCode
 **/

exports.createSecretQRCode = async (req, res) => {
  const secret_key = config.SECRET_KEY
  const authorization = req.headers.authorization || ''
  if (!authorization) return res.json('unauthorized')

  try {
    decoded = jwt.verify(authorization, secret_key)
  } catch (e) {
    return res.status(401).send('unauthorized')
  }
  userInfo = jwt.verify(authorization, secret_key)
  const otpauth_url = userInfo.otpauth_url
  QRCode.toDataURL(otpauth_url, function(err, data_url) {
    const data = {
      msg: err,
      data_url: `${data_url}`,
      status: 200
    } 
    return res.json(data)
  })
}

/**
 * POST
 * Public API
 * Verification Authenticator
 **/

exports.verificationAuthenticator = async (req, res) => {
  const secret_key = config.SECRET_KEY
  const authorization = req.headers.authorization || ''
  const userToken = req.body.userToken
  if (!authorization) return res.json('unauthorized')

  try {
    decoded = jwt.verify(authorization, secret_key)
  } catch (e) {
    return res.status(401).send('unauthorized')
  }
  userInfo = jwt.verify(authorization, secret_key)

  const secret = userInfo.secret
  const verified = speakeasy.totp.verify({ secret: secret,
    encoding: 'base32',
    token: userToken })

  const data = {
    msg: verified ? '驗證碼正確' : '驗證碼錯誤',
    verified: verified,
    status: 200
  } 
  return res.json(data)
}


/**
 * POST
 * Public API
 * Create new User
 **/

exports.createUser = async (req, res) => {
  try {
    // FJDIOdf1f4dKhPkQazck58olRjiPRcG $2b$10$1MZmWbp7c6oNVFAQh1Od0eWMCINFM7qixl14Z5zVFhpkgy4FYfgEO
    const secret_key = config.SECRET_KEY
    const authorization = req.headers.authorization
    const status = bcrypt.compareSync(secret_key, authorization)

    if (!status) return res.json(xhrErrors('authorization'))

    const username = req.body.username
    const password = req.body.password
    const email = req.body.email

    user.createUser(username, password, email, function(err, userId) {
      if (err) {
        res.json(err)
      }
      res.json(userId)
    })
  } catch (err) {
    return res.json(err)
  }
}
