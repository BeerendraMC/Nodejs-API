const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	_id: mongoose.ObjectId,
	name: { type: String, required: true },
	price: { type: Number, required: true },
	productImage: { type: String, required: true },
	inStock: { type: Number, required: true },
});

module.exports = mongoose.model('Product', productSchema);
