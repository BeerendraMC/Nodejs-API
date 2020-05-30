const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const DateOnly = require('mongoose-dateonly')(mongoose);

const config = require('../config/config.json');
const User = require('../models/users');
const Order = require('../models/order');
const Cart = require('../models/cart');

const dateonlyUtils = require('../utils/dateonly_utils');
const signupMailUtil = require('../utils/mail_templates/signup/signup_mail_util');

const signup_user = async (req, res) => {
	try {
		const dbUser = await User.findOne({ email: req.body.email }).exec();
		if (dbUser) {
			res.status(409).json({
				message: 'Email exists',
			});
		} else {
			const user = new User({
				_id: new mongoose.Types.ObjectId(),
				name: { first: req.body.firstName, last: req.body.lastName },
				email: req.body.email,
				gender: req.body.gender,
				mobile: req.body.mobile,
				dob: new DateOnly(req.body.dob),
				address: req.body.address ? [{
					houseOrBuilding: req.body.address.houseOrBuilding,
					area: req.body.address.area,
					landmark: req.body.address.landmark,
					city: req.body.address.city,
					pincode: req.body.address.pincode,
					state: req.body.address.state,
				}] : [],
				password: await bcrypt.hash(req.body.password, 10),
			});
			const result = await user.save();
			const emailResponse = await signupMailUtil.sendMailAfterSignup(result.fullname, result.email);
			res.status(201).json({
				message: 'User created',
				createdUser: {
					_id: result._id,
					email: result.email
				},
				emailResponse
			});
		}
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

const login_user = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			res.status(401).json({
				message: 'Auth failed',
			});
		} else {
			const response = await bcrypt.compare(req.body.password, user.password);
			if (response) {
				const token = jwt.sign(
					{
						email: user.email,
						fullname: user.fullname,
						isAdmin: user.isAdmin,
						userId: user._id,
					},
					config.JWT_KEY,
					{
						expiresIn: '1h',
					},
				);
				res.status(200).json({
					message: 'Auth successful',
					token
				});
			} else {
				res.status(401).json({
					message: 'Auth failed',
				});
			}
		}
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

const get_all_users = async (req, res) => {
	try {
		const users = await User.find()
			.select('_id name email gender mobile dob address')
			.exec();
		res.status(200).json(
			users.map(user => ({
				_id: user._id,
				name: user.name,
				email: user.email,
				gender: user.gender,
				mobile: user.mobile,
				dob: dateonlyUtils.getDateStringFromDateonly(user.dob.valueOf()),
				address: user.address
			}))
		);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

const get_user = async (req, res) => {
	try {
		const id = req.userData.userId;
		const user = await User.findById(id)
			.select('_id name email gender mobile dob address')
			.exec();
		if (user) {
			res.status(200).json({
				_id: user._id,
				name: user.name,
				email: user.email,
				gender: user.gender,
				mobile: user.mobile,
				dob: dateonlyUtils.getDateStringFromDateonly(user.dob.valueOf()),
				address: user.address
			});
		} else {
			res.status(404).json({
				message: 'User not found',
			});
		}
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

const patch_user = async (req, res) => {
	try {
		const updateOps = {};
		// eslint-disable-next-line max-len
		const encryptedPwd = Object.prototype.hasOwnProperty.call(req.body, 'password') ? await bcrypt.hash(req.body.password, 10) : null;
		Object.keys(req.body).forEach((ops) => {
			if (req.body[ops] && ops !== 'address') {
				switch (ops) {
					case 'firstName':
						updateOps['name.first'] = req.body[ops];
						break;
					case 'lastName':
						updateOps['name.last'] = req.body[ops];
						break;
					case 'dob':
						updateOps[ops] = new DateOnly(req.body[ops]);
						break;
					case 'password':
						updateOps[ops] = encryptedPwd;
						break;
					default:
						updateOps[ops] = req.body[ops];
				}
			}
		});
		const result = await User.updateOne({ _id: req.userData.userId }, { $set: updateOps }).exec();
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

const put_user_address = async (req, res) => {
	try {
		const user_id = req.userData.userId;
		const address_id = req.body._id;
		const addressOps = {};
		Object.keys(req.body).forEach((ops) => {
			if (req.body[ops]) {
				addressOps[ops] = req.body[ops];
			}
		});
		const user = await User.findById(user_id).exec();
		if (address_id) {
			const address = user.address.id(address_id);
			address.set(addressOps);
			const result = await user.save();
			res.status(200).json(result.address);
		} else {
			user.address.push(addressOps);
			const result = await user.save();
			res.status(200).json(result.address);
		}
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

const delete_user_address = async (req, res) => {
	try {
		const user = await User.findById(req.userData.userId).exec();
		const address = user.address.id(req.params.addressId);
		if (address) {
			address.remove();
			await user.save();
			res.status(200).json({
				message: 'Address deleted'
			});
		} else {
			res.status(404).json({
				message: 'Address not found'
			});
		}
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

const delete_user = async (req, res) => {
	try {
		const id = req.userData.userId;
		const user = await User.findById(id).exec();
		if (user) {
			const [, , result] = await Promise.all([
				Cart.deleteMany({ userId: id }).exec(),
				Order.deleteMany({ userId: id }).exec(),
				User.deleteOne({ _id: id }).exec()
			]);
			res.status(200).json({
				message: 'User deleted',
				result
			});
		} else {
			res.status(404).json({
				message: 'User not found',
			});
		}
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

module.exports = {
	signup_user,
	login_user,
	get_all_users,
	get_user,
	patch_user,
	put_user_address,
	delete_user_address,
	delete_user,
};
