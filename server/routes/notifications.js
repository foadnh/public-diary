'use strict';

// User routes use users controller
var notifications = require('../controllers/notifications');

module.exports = function(app, passport) {

	app.route('/notifications')
		.get(notifications.get); // Get notifications

	app.route('/notifications/unread-count')
		.get(notifications.getUnreadCount); // Get number of unread notifications

	app.route('/notifications/read/:notificationId')
		.post(notifications.read); // Mark notification as readed by ID

};
