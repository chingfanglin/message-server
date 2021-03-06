
const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const usersController = require('../controllers/usersController')
const channelController = require('../controllers/channelController')
const chatController = require('../controllers/chatController')

router.post('/login', authController.login)
router.post('/createSecretQRCode', authController.createSecretQRCode)
router.post('/verificationAuthenticator', authController.verificationAuthenticator)

router.post('/registered', authController.createUser)
router.post('/joinChannel', channelController.joinChannel)
router.get('/getUserChannel', channelController.getUserChannel)

router.post('/getUserChat', channelController.getUserChat)

router.post('/sendMessage', chatController.sendMessage)
router.post('/addFriends', usersController.addFriends)
router.post('/delFriends', usersController.delFriends)
router.post('/agreeFriends', usersController.agreeFriends)
router.post('/blockFriends', usersController.blockFriends)

router.get('/users/:username', usersController.getUser)

module.exports = router