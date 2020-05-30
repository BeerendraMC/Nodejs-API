const express = require('express');

const router = express.Router();
const { authentication } = require('../middleware/auth');

const ordersContoller = require('../controllers/orders');

router.get('/', authentication, ordersContoller.get_all_orders);

router.post('/', authentication, ordersContoller.post_orders);

router.delete('/:orderId', authentication, ordersContoller.delete_order);

module.exports = router;
