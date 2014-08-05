'use strict';

//Global service for global variables
angular.module('mean.system').factory('Diary', ['$resource', '$http',
	function($resource, $http) {
		var Diary = $resource('/diary/:diaryId', {
			diaryId: '@diaryId'
		});
		return {
			getId: function(diaryId, failureCallback, successCallback) {
				return Diary.get({
						diaryId: diaryId
					},
					successCallback,
					failureCallback);
			},

			save: function(diary, callback) {
				return Diary.save({},
					diary,
					callback,
					function(err) {
						console.log(err);
					}
				);
			},

			getNear: function(lat, lng, dist, callback) {
				return $http
					.get(
						'/diary/near/' + lat + '/' + lng + '/' + dist)
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			getBox: function(box, pageSize, page, sort, callback) {
				var skip = (page - 1) * pageSize;
				return $http
					.get(
						'/diary/box/' + box.x1 + '/' + box.y1 + '/' + box.x2 + '/' + box.y2 +
						'?skip=' + skip + '&size=' + pageSize + '&sort=' + sort.sort + '&order=' + sort.order)
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			getTag: function(tag, pageSize, page, sort, callback) {
				var skip = (page - 1) * pageSize;
				return $http
					.get(
						'/diary/tag/' + tag +
						'?skip=' + skip + '&size=' + pageSize + '&sort=' + sort.sort + '&order=' + sort.order)
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			getUser: function(user, pageSize, page, sort, callback) {
				var skip = (page - 1) * pageSize;
				return $http
					.get(
						'/diary/user/' + user +
						'?skip=' + skip + '&size=' + pageSize + '&sort=' + sort.sort + '&order=' + sort.order)
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			search: function(key, callback) {
				return $http
					.get('/diary/search/' + key)
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			edit: function(diaryId, diary, callback) {
				return $http
					.post('/diary/edit/' + diaryId, {
						title: diary.title,
						text: diary.text,
						showUser: diary.showUser
					})
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			editTags: function(diaryId, diary, callback) {
				return $http
					.post('/diary/edit-tags/' + diaryId, {
						tags: diary.tags
					})
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			toggleLike: function(diaryId, callback) {
				return $http
					.post('/diary/toggle-like/' + diaryId)
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			delete: function(diaryId, callback) {
				return $http
					.post('/diary/delete/' + diaryId)
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			/*
			 * Admin services
			 */
			adminGetId: function(diaryId, callback) {
				return $http
					.get('/admin/diary/' + diaryId)
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			adminEdit: function(diaryId, diary, callback) {
				return $http
					.post('/admin/diary/edit/' + diaryId, diary)
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			adminDelete: function(diaryId, callback) {
				return $http
					.post('/admin/diary/delete/' + diaryId)
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			}
		};
	}
]);
