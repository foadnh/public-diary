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
	if (!req.body.type || !req.body.refer)
		return res.status(400).send('You have to pass "type" and "refer" parameters.');
	Notif
		.find({
			type: req.body.type,
			refer: req.body.refer
		})
		.where({
			user: req.user._id
		})
		.sort({
			$natural: -1
		})
		.limit(100)
		.select('read')
		.exec(function(err, notifications) {
			if (err) {
				log.error('read: Executing failed.', {
					err: err
				});
				return res.status(400).send('Something went wrong in getting notifications.');
			}
			for (var i = notifications.length - 1; i >= 0; i--) {
				notifications[i].read = true;
				notifications[i].save(function(err) {
					if (err) {
						log.error('read: Saving notifications failed.', {
							err: err
						});
					}
				});
				return res.send('Notifications marked as readed.');
			}
		});
};
