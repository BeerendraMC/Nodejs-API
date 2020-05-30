const nodemailer = require('nodemailer');
const config = require('../config/config.json');

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true, // true for 465, false for other ports
	auth: {
		type: 'OAuth2',
		user: config.GMAIL_ID,
		clientId: config.CLIENT_ID,
		clientSecret: config.CLIENT_SECRET,
		refreshToken: config.REFRESH_TOKEN,
		accessToken: config.ACCESS_TOKEN,
		expires: 1484314697598
	}
});

/**
 * Sends email with plain text body to the given toAddress (using nodemailer)
 * @param {string} toAddress to address (comma separated email id's if more than one recepient)
 * @param {string} subjectLine subject line
 * @param {string} plainTextBody plain text body
 * @returns {Promise<string>} response from nodemailer
 */
const sendWithPlainTextBody = async (toAddress, subjectLine, plainTextBody) => {
	try {
		const info = await transporter.sendMail({
			from: '"Scotch Hub team" <no-reply@scotch-hub.com>',
			to: toAddress, // comma separated email id's if more than one recepient
			subject: subjectLine,
			text: plainTextBody
		});
		return Promise.resolve(`Mail sent: ${info.messageId}`);
	} catch (err) {
		return Promise.reject(err);
	}
};


/**
 * Sends email with html body to the given toAddress (using nodemailer)
 * @param {string} toAddress to address (comma separated email id's if more than one recepient)
 * @param {string} subjectLine subject line
 * @param {string} htmlBody html body
 * @returns {Promise<string>} response from nodemailer
 */
const sendWithHTMLBody = async (toAddress, subjectLine, htmlBody) => {
	try {
		const info = await transporter.sendMail({
			from: '"Scotch Hub team" <no-reply@scotch-hub.com>',
			to: toAddress,
			subject: subjectLine,
			html: htmlBody
		});
		return Promise.resolve(`Mail sent: ${info.messageId}`);
	} catch (err) {
		return Promise.reject(err);
	}
};

/**
 * Sends email with html body and attachments to the given toAddress (using nodemailer)
 * @param {string} toAddress to address (comma separated email id's if more than one recepient)
 * @param {string} subjectLine subject line
 * @param {string} htmlBody html body (read a file)
 * @param {array} attachments array of attachment objects
 * @returns {Promise<string>} response from nodemailer
 */
const sendWithHTMLBodyAndAttachments = async (toAddress, subjectLine, htmlBody, attachments) => {
	try {
		const info = await transporter.sendMail({
			from: '"Scotch Hub team" <no-reply@scotch-hub.com>',
			to: toAddress,
			subject: subjectLine,
			html: htmlBody,
			attachments
		});
		return Promise.resolve(`Mail sent: ${info.messageId}`);
	} catch (err) {
		return Promise.reject(err);
	}
};

module.exports = {
	sendWithPlainTextBody,
	sendWithHTMLBody,
	sendWithHTMLBodyAndAttachments
};
