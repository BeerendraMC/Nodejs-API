const mongoose = require('mongoose');

const Product = require('../models/product');
const Order = require('../models/order');
const Cart = require('../models/cart');

const get_all_products = (req, res) => {
	Product.find()
		.select('_id name price productImage inStock')
		.exec()
		.then((docs) => {
			res.status(200).json(docs);
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
};

const post_product = (req, res) => {
	const product = new Product({
		_id: new mongoose.Types.ObjectId(),
		name: req.body.name,
		price: req.body.price,
		productImage: req.file.path,
		inStock: req.body.inStock,
	});
	product
		.save()
		.then((result) => {
			res.status(201).json({
				message: 'Created a product',
				createdProduct: {
					_id: result._id,
					name: result.name,
					price: result.price,
					productImage: result.productImage,
					inStock: result.inStock
				},
			});
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
};

const get_product = (req, res) => {
	const id = req.params.productId;
	Product.findById(id)
		.select('_id name price productImage inStock')
		.exec()
		.then((doc) => {
			if (doc) {
				res.status(200).json(doc);
			} else {
				res.status(404).json({ message: 'No valid entry found for product Id' });
			}
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
};

const patch_product = (req, res) => {
	const id = req.params.productId;
	const updateOps = {};
	Object.keys(req.body).forEach((ops) => {
		if (req.body[ops]) {
			updateOps[ops] = req.body[ops];
		}
	});
	Product.updateOne({ _id: id }, { $set: updateOps })
		.exec()
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
};

const delete_product = async (req, res) => {
	try {
		const id = req.params.productId;
		const product = await Product.findById(id).exec();
		if (product) {
			const [, , result] = await Promise.all([
				Cart.deleteMany({ productId: id }).exec(),
				Order.deleteMany({ productId: id }).exec(),
				Product.deleteOne({ _id: id }).exec()
			]);
			res.status(200).json({
				message: 'Product deleted',
				result,
			});
		} else {
			res.status(404).json({
				message: 'Product not found',
			});
		}
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

module.exports = {
	get_all_products,
	post_product,
	get_product,
	patch_product,
	delete_product,
};
