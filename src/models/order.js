const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
	_id: mongoose.ObjectId,
	productId: { type: mongoose.ObjectId, ref: 'Product', required: true },
	quantity: { type: Number, default: 1 },
	orderDate: { type: Date, default: Date.now },
	userId: { type: mongoose.ObjectId, ref: 'User', required: true },
	shippingAddress: { type: mongoose.ObjectId, required: true }
});

module.exports = mongoose.model('Order', orderSchema);
