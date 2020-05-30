const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
	_id: mongoose.ObjectId,
	productId: { type: mongoose.ObjectId, ref: 'Product', required: true },
	quantity: { type: Number, default: 1 },
	userId: { type: mongoose.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Cart', cartSchema);
