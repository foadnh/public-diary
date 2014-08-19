'use strict';

// User routes use users controller
var diaries = require('../controllers/diaries');

module.exports = function(app, passport) {

	app.route('/diary')
		.post(diaries.create); // Create new diary

	app.route('/diary/id/:diaryId')
		.get(diaries.getId); // Get diary by ID

	app.route('/diary/near/:lat/:lng/:dist')
		.get(diaries.getNear); // Get diaries by coordinates and distance

	app.route('/diary/box/:x1/:y1/:x2/:y2')
		.get(diaries.getBox); // Get diaries in box

	app.route('/diary/tag/:tag')
		.get(diaries.getTag); // Get diaries by tag

	app.route('/diary/user/:user')
		.get(diaries.getUser); // Get diaries by user

	app.route('/diary/stream')
		.get(diaries.getStream); // Get stream of followed users diaries

	app.route('/diary/search/:key')
		.get(diaries.search); // Search diaries by text

	app.route('/diary/edit/:diaryId')
		.post(diaries.edit); //	Edit diary by ID

	app.route('/diary/edit-tags/:diaryId')
		.post(diaries.editTags); //	Edit tags by ID

	app.route('/diary/like/:diaryId')
		.post(diaries.like); //	Like diary

	app.route('/diary/unlike/:diaryId')
		.post(diaries.unlike); //	Unlike diary

	app.route('/diary/toggle-like/:diaryId')
		.post(diaries.toggleLike); //	Toggle like of diary

	app.route('/diary/image')
		.post(diaries.postImage); //	Save temporary image for a diary

	app.route('/diary/delete/:diaryId')
		.post(diaries.delete); // Delete diary by ID

/*
 * Admin routes
 */
	app.route('/admin/diary/:diaryId')
		.get(diaries.adminGetId); // Admin get diary by ID

	app.route('/admin/diary/edit/:diaryId')
		.post(diaries.adminEdit); // Admin edit diary by ID

	app.route('/admin/diary/delete/:diaryId')
		.post(diaries.adminDelete); // Admin delete diary by ID

};
