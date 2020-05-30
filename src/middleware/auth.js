const jwt = require('jsonwebtoken');
const config = require('../config/config.json');

const authentication = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(' ')[1];
		const decoded = jwt.verify(token, config.JWT_KEY);
		req.userData = decoded;
		next();
	} catch (error) {
		res.status(401).json({
			message: 'Auth failed',
			error,
		});
	}
};

const authorize = (req, res, next) => {
	if (req.userData.isAdmin) {
		next();
	} else {
		res.status(403).json({
			message: 'You don\'t have access to this resource'
		});
	}
};

module.exports = {
	authentication,
	authorize
};
