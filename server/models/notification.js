'use strict';

/*
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/*
 * Notification Schema
 */
var NotificationSchema = new Schema({
	date: {
		type: Date,
		required: true,
		default: Date.now,
	},
	read: {
		type: Boolean,
		default: false
	},
	refer: {
		type: Schema.Types.ObjectId
	},
	type: {
		type: String,
		required: true,
		enum: ['vote', 'follow']
	},
	user: {
		type: Schema.Types.ObjectId,
		required: true,
		index: true
	}
});

/*
 * Indexing
 */
NotificationSchema.index({
	type: 1,
	refer: 1
});

/*
 * Model creation
 */
mongoose.model('Notification', NotificationSchema);
