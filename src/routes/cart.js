const express = require('express');

const router = express.Router();
const { authentication } = require('../middleware/auth');

const cartContoller = require('../controllers/cart');

router.get('/', authentication, cartContoller.get_cart_items);

router.post('/', authentication, cartContoller.post_cart_item);

router.patch('/:cartId', authentication, cartContoller.patch_cart);

router.delete('/:cartId', authentication, cartContoller.delete_cart_item);

module.exports = router;
