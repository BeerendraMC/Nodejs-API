const mongoose = require('mongoose');

const Cart = require('../models/cart');
const Product = require('../models/product');

const get_cart_items = async (req, res) => {
	try {
		const cart_items = await Cart.find({ userId: req.userData.userId })
			.select('_id productId quantity')
			.populate('productId', 'name price')
			.exec();
		res.status(200).json(
			cart_items.map((item) => ({
				_id: item._id,
				product: item.productId,
				quantity: item.quantity
			}))
		);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

const post_cart_item = async (req, res) => {
	try {
		const product_id = req.body.productId;
		const user_id = req.userData.userId;
		const product = await Product.findById(product_id).exec();
		if (!product) {
			return res.status(404).json({
				message: 'Product not found',
			});
		} else if (product.inStock === 0) {
			return res.status(200).json({
				message: 'Product is out of stock'
			});
		}
		if (Number(req.body.quantity) <= product.inStock) {
			const cart_item = new Cart({
				_id: new mongoose.Types.ObjectId(),
				productId: product_id,
				quantity: req.body.quantity === 0 ? 1 : req.body.quantity,
				userId: user_id
			});
			const result = await cart_item.save();
			res.status(201).json({
				message: 'Product added to cart',
				createdCart: {
					_id: result._id,
					productId: result.productId,
					quantity: result.quantity,
					userId: result.userId
				}
			});
		} else {
			res.status(200).json({
				message: 'Quantity is more than stock'
			});
		}
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

const patch_cart = async (req, res) => {
	try {
		const updateOps = {};
		Object.keys(req.body).forEach((ops) => {
			if (req.body[ops]) {
				updateOps[ops] = req.body[ops];
			}
		});
		const result = await Cart.updateOne({ _id: req.params.cartId }, { $set: updateOps }).exec();
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

const delete_cart_item = async (req, res) => {
	try {
		const cart_id = req.params.cartId;
		const cart_item = await Cart.findById(cart_id).exec();
		if (cart_item) {
			const result = await Cart.deleteOne({ _id: cart_id }).exec();
			res.status(200).json({
				message: 'Cart item deleted',
				result
			});
		} else {
			res.status(404).json({
				message: 'No entry found'
			});
		}
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

module.exports = {
	get_cart_items,
	post_cart_item,
	delete_cart_item,
	patch_cart
};
