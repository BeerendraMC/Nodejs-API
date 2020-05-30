const express = require('express');

const router = express.Router();
const { authentication, authorize } = require('../middleware/auth');
const multer = require('../middleware/multer');

const productsController = require('../controllers/products');

router.get('/', productsController.get_all_products);

router.post('/', authentication, authorize, multer.upload.single('productImage'), productsController.post_product);

router.get('/:productId', productsController.get_product);

router.patch('/:productId', authentication, authorize, productsController.patch_product);

router.delete('/:productId', authentication, authorize, productsController.delete_product);

module.exports = router;
