/* eslint-disable max-len */
/* eslint-disable no-useless-escape */
const mongoose = require('mongoose');
const DateOnly = require('mongoose-dateonly')(mongoose);

const addressSchema = new mongoose.Schema({
	houseOrBuilding: String,
	area: String,
	landmark: String,
	city: String,
	pincode: Number,
	state: String,
	addressType: String
});

const userSchema = new mongoose.Schema({
	_id: mongoose.ObjectId,
	name: {
		first: { type: String, required: true },
		last: { type: String, required: true },
	},
	email: {
		type: String,
		required: true,
		match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	},
	gender: { type: String, required: true },
	mobile: { type: Number, required: true },
	dob: { type: DateOnly, required: true },
	password: { type: String, required: true },
	isAdmin: { type: Boolean, default: false },
	address: [addressSchema]
},
{
	toObject: { virtuals: true },
	toJSON: { virtuals: true }
});

userSchema.virtual('fullname').get(function () {
	return `${this.name.first} ${this.name.last}`;
});

module.exports = mongoose.model('User', userSchema);
