/* eslint-disable max-len */
const fs = require('fs');
const util = require('util');
const path = require('path');

const emailUtils = require('../../email_utils');

const readFile = util.promisify(fs.readFile);

const sendOrderConfirmationMail = async (username, email, orders, shippingAddress) => {
	try {
		let orders_html = await readFile(path.join(__dirname, '/orders_template.html'), { encoding: 'utf-8' });
		let subtotal = 0;
		let ordersTableHtml = '<table style="width: 100%">';
		orders.forEach(order => {
			subtotal += Number(order.quantity) * Number(order.product.price);
			ordersTableHtml += `
                <tr>
                    <td rowspan="3" style="padding-right: 10%">
                        <img src="cid:${String(order.product._id)}" alt="product image" style="width:100px; height: auto"/>
                    </td>
                    <td>
                        <p style="margin: 0"><b>Product: ${order.product.name}</b></p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p style="margin: 0"><b>Price:</b> ${order.product.price}</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p style="margin: 0"><b>Quantity:</b> ${order.quantity}</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <br />
                    </td>
                </tr>`;
		});
		ordersTableHtml += '</table>';
		const shipping = 80 * orders.length;
		const tax = 10 * orders.length;
		const total = subtotal + shipping + tax;
		const shippingAddress_html = `<div>
                <p style="margin: 0">${shippingAddress.houseOrBuilding}</p>
                <p style="margin: 0">${shippingAddress.area}</p>
                <p style="margin: 0">${shippingAddress.landmark}</p>
                <p style="margin: 0">${shippingAddress.city}</p>
                <p style="margin: 0">${shippingAddress.pincode}</p>
                <p style="margin: 0">${shippingAddress.state}</p>
                <p style="margin: 0">Address type: ${shippingAddress.addressType}</p>
            </div>`;
		orders_html = orders_html.replace('{username}', username);
		orders_html = orders_html.replace('{ordersTable}', ordersTableHtml);
		orders_html = orders_html.replace('{subtotal}', String(subtotal));
		orders_html = orders_html.replace('{shipping}', String(shipping));
		orders_html = orders_html.replace('{tax}', String(tax));
		orders_html = orders_html.replace('{total}', String(total));
		orders_html = orders_html.replace('{shippingAddress}', shippingAddress_html);
		const attachments = orders.map(order => ({
			filename: `${order.product.name.replace(/ /g, '_')}.jpg`,
			path: path.resolve(`./uploads/${order.product.productImage.substring(order.product.productImage.indexOf('2'))}`),
			cid: String(order.product._id)
		}));
		const emailResponse = await emailUtils.sendWithHTMLBodyAndAttachments(
			email,
			'Order confirmed',
			orders_html,
			attachments
		);
		return Promise.resolve(emailResponse);
	} catch (err) {
		return Promise.reject(err);
	}
};

module.exports = {
	sendOrderConfirmationMail
};
