/* eslint-disable no-await-in-loop */
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/users');
const Cart = require('../models/cart');
const ordersMailUtil = require('../utils/mail_templates/orders/orders_mail_utils');

const get_all_orders = async (req, res) => {
	try {
		const user_id = req.userData.userId;
		const user = await User.findById(user_id).exec();
		const orders = await Order.find({ userId: user_id })
			.select('_id productId quantity orderDate shippingAddress')
			.populate('productId', 'name price')
			.exec();
		res.status(200).json(orders.map(order => ({
			_id: order._id,
			product: order.productId,
			quantity: order.quantity,
			orderDate: order.orderDate,
			shippingAddress: user.address.id(order.shippingAddress)
		})));
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

const post_orders = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const currentUserId = req.userData.userId;
		const newOrders = req.body.map(order => ({
			productId: order.productId,
			quantity: order.quantity === 0 ? 1 : order.quantity,
			orderDate: new Date(),
			userId: currentUserId,
			shippingAddress: order.shippingAddress
		}));
		await Cart.deleteMany({ userId: currentUserId }, { session });
		const result = await Order.insertMany(newOrders, { session });
		// eslint-disable-next-line no-restricted-syntax
		for (const order of newOrders) {
			await Product.updateOne(
				{ _id: order.productId },
				{ $inc: { inStock: -Number(order.quantity) } },
				{ session }
			).exec();
		}
		const user = await User.findById(currentUserId).session(session).exec();
		const ordersList = await Promise.all(
			result.map(async order => ({
				product: await Product.findById(order.productId).session(session).exec(),
				quantity: order.quantity,
				orderDate: order.orderDate,
				shippingAddress: order.shippingAddress
			}))
		);
		const shippingAddress = user.address.id(ordersList[0].shippingAddress);
		await ordersMailUtil.sendOrderConfirmationMail(user.fullname, user.email, ordersList, shippingAddress);
		await session.commitTransaction();
		session.endSession();
		res.status(201).json({
			message: 'Order/s placed successfully',
			createdOrders: result.map(ord => ({
				_id: ord._id,
				productId: ord.productId,
				quantity: ord.quantity,
				orderDate: ord.orderDate,
				shippingAddress: ord.shippingAddress
			}))
		});
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		res.status(500).json({ error: err });
	}
};

const delete_order = (req, res) => {
	const id = req.params.orderId;
	Order.deleteOne({ _id: id })
		.exec()
		.then((result) => {
			res.status(200).json({
				message: 'Order deleted',
				result,
			});
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
};

module.exports = {
	get_all_orders,
	post_orders,
	delete_order
};
