const fs = require('fs');
const util = require('util');
const path = require('path');

const emailUtils = require('../../email_utils');

const readFile = util.promisify(fs.readFile);

const sendMailAfterSignup = async (username, email) => {
	try {
		// eslint-disable-next-line max-len
		let signup_html = await readFile(path.join(__dirname, '/signup_template.html'), { encoding: 'utf-8' });
		signup_html = signup_html.replace('{username}', username);
		const attachments = [
			{
				filename: 'wine.jpg',
				path: path.join(__dirname, '/images/wine.jpg'),
				cid: 'wineImage'
			},
			{
				filename: 'winery.png',
				path: path.join(__dirname, '/images/winery.png'),
				cid: 'wineryImage'
			},
			{
				filename: 'facebook2x.png',
				path: path.join(__dirname, '/images/facebook2x.png'),
				cid: 'facebook2xImage'
			},
			{
				filename: 'instagram2x.png',
				path: path.join(__dirname, '/images/instagram2x.png'),
				cid: 'instagram2xImage'
			},
			{
				filename: 'linkedin2x.png',
				path: path.join(__dirname, '/images/linkedin2x.png'),
				cid: 'linkedin2xImage'
			},
			{
				filename: 'twitter2x.png',
				path: path.join(__dirname, '/images/twitter2x.png'),
				cid: 'twitter2xImage'
			}
		];
		const emailResponse = await emailUtils.sendWithHTMLBodyAndAttachments(
			email,
			'Welcome to Scotch hub 🎉🎈',
			signup_html,
			attachments
		);
		return Promise.resolve(emailResponse);
	} catch (err) {
		return Promise.reject(err);
	}
};

module.exports = {
	sendMailAfterSignup
};
