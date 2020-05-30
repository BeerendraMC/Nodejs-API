/**
 * Get date string from dateonly value
 * @param {number} dateonly dateonly value
 * @returns {string} date string
 */
const getDateStringFromDateonly = (dateonly) => {
	const a = String(dateonly).split('');
	const year = a[0] + a[1] + a[2] + a[3];
	let month = a[4] + a[5];
	const day = a[6] + a[7];
	month = Number(month);
	month = month < 10 ? `0${month + 1}` : month + 1;
	return `${year}/${month}/${day}`;
};

module.exports = {
	getDateStringFromDateonly
};
