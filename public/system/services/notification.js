'use strict';

//Global service for global variables
angular.module('mean.system').factory('Notifications', ['$http', // Notifications instead of Notification because of javascripts Notification
	function($http) {
		return {
			get: function(callback) {
				return $http
					.get('/notifications')
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			unreadCount: function(callback) {
				return $http
					.get('/notifications/unread-count')
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			read: function(params, callback) {
				return $http
					.post('/notifications/read/', params)
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			}
		};
	}
]);
