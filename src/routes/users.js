const express = require('express');

const router = express.Router();

const { authentication, authorize } = require('../middleware/auth');
const userController = require('../controllers/users');

router.post('/signup', userController.signup_user);

router.post('/login', userController.login_user);

router.get('/get-all-users', authentication, authorize, userController.get_all_users);

router.get('/', authentication, userController.get_user);

router.patch('/', authentication, userController.patch_user);

router.put('/address', authentication, userController.put_user_address);

router.delete('/address/:addressId', authentication, userController.delete_user_address);

router.delete('/', authentication, userController.delete_user);

module.exports = router;
