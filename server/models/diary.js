'use strict';

/*
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	User = mongoose.model('User');

/*
 * Diary modify Schema
 */
var DiaryModifySchema = new Schema({
	title: {
		type: String
	},
	text: {
		type: String,
		required: true
	},
	modifiedDate: {
		type: Date,
		required: true,
	}
});

/*
 * Diary Schema
 */
var DiarySchema = new Schema({
	createdDate: {
		type: Date,
		required: true,
		default: Date.now,
		index: true
	},
	image: {
		type: String
	},
	lastModifiedDate: {
		type: Date
	},
	loc: {
		type: [Number],
		index: '2dsphere',
		required: true
	},
	modifies: {
		type: [DiaryModifySchema]
	},
	showUser: {
		type: Boolean,
		default: true
	},
	tags: {
		type: [String],
		index: true
	},
	text: {
		type: String,
		required: true,
	},
	title: {
		type: String,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	vote: {
		type: Number,
		default: 0
	},
	votes: {
		type: [mongoose.Schema.Types.ObjectId]
	}
});

/*
 * Validators
 */
var lengthMax = function(lMax) {
	return function(val) {
		if (!val)
			return true;
		if (val.length <= lMax)
			return true;
		return false;
	};
};

DiarySchema.path('title').validate(lengthMax(64), 'So long title.');
DiaryModifySchema.path('title').validate(lengthMax(64), 'So long title.');

var coordinateCheck = function(val) {
	if (!val)
		return false;
	if (val.length !== 2)
		return false;
	if (val[0] < -90 || val[0] > 90)
		return false;
	if (val[1] < -180 || val[1] > 180)
		return false;
	return true;
};

DiarySchema.path('loc').validate(coordinateCheck, 'No valid coordinates.');

/*
 * Text indexing
 */
var textSearch = require('mongoose-text-search');
DiarySchema.plugin(textSearch);

DiarySchema.index({
	title: 'text',
	text: 'text',
	tags: 'text'
}, {
	name: 'full-search-index',
	weights: {
		tags: 8,
		title: 4
	}
});

/*
 * Model creation
 */
mongoose.model('Diary', DiarySchema);
