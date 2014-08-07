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
	if (req.user)
		Notif
			.find({
				user: req.user._id
			})
			.limit(100)
			.exec(function(err, notifications) {
				if (err) {
					log.error('get: Executing failed.', {
						err: err
					});
					return res.status(400).send('Something went wrong in getting notifications.');
				} else {
					return res.json(notifications);
				}
			});
	else
		return res.status(400).send('User is not logged in.');
};
