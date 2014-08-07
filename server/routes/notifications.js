'use strict';

// User routes use users controller
var notifications = require('../controllers/notifications');

module.exports = function(app, passport) {

	app.route('/notifications')
		.get(notifications.get); // Get notifications

};
