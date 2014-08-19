'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Notif = mongoose.model('Notification');

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
			filename: 'log/users',
			handleExceptions: true,
			exitOnError: false
		})
	]
});

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
	res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
	if (req.isAuthenticated()) {
		return res.redirect('/');
	}
	res.redirect('#!/login');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
	res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res, next) {
	var user = new User(req.body);

	user.provider = 'local';

	// because we set our user.provider to local our models/user.js validation will always be true
	req.assert('name', 'You must enter a name').notEmpty();
	req.assert('email', 'You must enter a valid email address').isEmail();
	req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
	req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
	req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send(errors);
	}

	// Hard coded for now. Will address this with the user permissions system in v0.3.5
	user.roles = ['authenticated'];
	user.save(function(err) {
		if (err) {
			switch (err.code) {
				case 11000:
				case 11001:
					res.status(400).send('Username already taken');
					break;
				default:
					res.status(400).send('Please fill all the required fields');
			}

			return res.status(400);
		}
		req.logIn(user, function(err) {
			if (err) return next(err);
			return res.redirect('/');
		});
		res.status(200);
	});
};
/**
 * Send User
 */
exports.me = function(req, res) {
	res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
	User
		.findOne({
			_id: id
		})
		.exec(function(err, user) {
			if (err) return next(err);
			if (!user) return next(new Error('Failed to load User ' + id));
			req.profile = user;
			next();
		});
};

/*
 * Get user's information by ID
 */
exports.getInfo = function(req, res) {
	var select = 'name username';
	if (req.user && String(req.user._id) === req.params.userId)
		select += ' email follows followsFull';
	User
		.findById(req.params.userId)
		.select(select)
		.exec(function(err, user) {
			if (err) {
				log.error('getInfo: Executing failed.', {
					err: err
				});
				return res.status(400).send('Something went wrong in getting user.');
			}
			return res.json(user);
		});
};

/*
 * Follow user
 */
exports.follow = function(req, res) {
	if (!req.user)
		return res.status(400).send('You must be logged in user.');
	if (String(req.user._id) === req.body.id)
		return res.status(400).send('You Can\'t follow yourself.');
	User
		.findById(req.user._id)
		.select('follows')
		.exec(function(err, user) {
			if (err) {
				log.error('follow: Executing failed.', {
					err: err
				});
				return res.status(400).send('Something went wrong in getting user.');
			}
			if (user.follows.indexOf(req.body.id) !== -1)
				return res.status(400).send('User is all ready followed.');
			user.follows.push(req.body.id);
			user.save(function(err, result) {
				if (err) {
					log.error('follow: Saving user failed.', {
						err: err
					});
					return res.status(400).send('Saving user failed.');
				}
				var notif = new Notif({
					type: 'follow',
					refer: req.user._id,
					user: req.body.id
				});
				notif.save();
				return res.send('User followed.');
			});
		});
};

/*
 * Unfollow user
 */
exports.unfollow = function(req, res) {
	if (!req.user)
		return res.status(400).send('You must be logged in user.');
	User
		.findById(req.user._id)
		.select('follows')
		.exec(function(err, user) {
			if (err) {
				log.error('unfollow: Executing failed.', {
					err: err
				});
				return res.status(400).send('Something went wrong in getting user.');
			}
			console.log(user.follows);
			var userIndex = user.follows.indexOf(req.body.id);
			if (userIndex === -1)
				return res.status(400).send('User is not followed.');
			user.follows.splice(userIndex, 1);
			user.save(function(err, result) {
				if (err) {
					log.error('unfollow: Saving user failed.', {
						err: err
					});
					return res.status(400).send('Saving user failed.');
				}
				return res.send('User unfollowed.');
			});
		});
};

/*
 * Follow full user
 */
exports.followFull = function(req, res) {};

/*
 * Unfollow full user
 */
exports.unfollowFull = function(req, res) {};
