'use strict';

/*
 * Module dependencies
 */
var mongoose = require('mongoose'),
	Notif = mongoose.model('Notification'); // To not replace javascripts Notification

/*
 * Logger dependencies
 */
var winston = require('winston');
var log = new(winston.Logger)({
	transports: [
		new(winston.transports.Console)({
			colorize: true
		}),
		new(winston.transports.File)({
			filename: 'log/notifications',
			handleExceptions: true,
			exitOnError: false
		})
	]
});

/*
 * Global variables
 */

/*
 * Get notifications
 */
exports.get = function(req, res) {
	if (!req.user)
		return res.status(400).send('User is not logged in.');
	Notif
		.find({
			user: req.user._id
		})
		.sort({
			$natural: -1
		})
		.limit(100)
		.exec(function(err, notifications) {
			if (err) {
				log.error('get: Executing failed.', {
					err: err
				});
				return res.status(400).send('Something went wrong in getting notifications.');
			}
			return res.json(notifications);
		});
};

/*
 * Get number of unread notifications
 */
exports.getUnreadCount = function(req, res) {
	if (!req.user)
		return res.status(400).send('User is not logged in.');
	Notif
		.find({
			user: req.user._id
		})
		.sort({
			$natural: -1
		})
		.limit(100)
		.select('read')
		.exec(function(err, notifications) {
			if (err) {
				log.error('getUnreadCount: Executing failed.', {
					err: err
				});
				return res.status(400).send('Something went wrong in getting number of unread notifications.');
			}
			var count = 0;
			for (var i = notifications.length - 1; i >= 0; i--)
				if (!notifications[i].read)
					count++;
			return res.json(count);
		});
};

/*
 * Mark notification as readed by ID
 */
exports.read = function(req, res) {
	if (!req.user)
		return res.status(400).send('User is not logged in.');
	Notif
		.findById(req.params.notificationId)
		.where({
			user: req.user._id
		})
		.sort({
			$natural: -1
		})
		.limit(100)
		.select('read')
		.exec(function(err, notification) {
			if (err) {
				log.error('read: Executing failed.', {
					err: err
				});
				return res.status(400).send('Something went wrong in getting notification.');
			}
			notification.read = true;
			notification.save(function(err) {
				if (err) {
					log.error('read: Saving notification failed.', {
						err: err
					});
					return res.status(400).send('Saving notification failed.');
				}
				return res.send('Notification marked as readed.');
			});
		});
};
