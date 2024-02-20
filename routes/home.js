const express = require('express')
const router = express.Router()
const homeController = require('../controllers/homeController')

router.get('/', homeController.home)

router.get('/signup', homeController.signup_get)

router.post('/signup', homeController.signup_post)

router.get('/login', homeController.login_get)

router.post('/login', homeController.login_post)

router.get('/logout', homeController.logout)

router.get('/join-secret-club', homeController.join_secret_club_get)

router.post('/join-secret-club', homeController.join_secret_club_post)

router.get('/admin-form', homeController.admin_form_get)

router.post('/admin-form', homeController.admin_form_post)

router.get('/new-message', homeController.new_message_get)

router.post('/new-message', homeController.new_message_post)

router.post('/:id/delete', homeController.delete_message_post)

module.exports = router
