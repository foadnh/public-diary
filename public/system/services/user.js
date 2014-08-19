'use strict';

//Global service for global variables
angular.module('mean.system').factory('User', ['$http',
	function($http) {
		return {
			getInfo: function(user, callback) {
				return $http
					.get('/user/info/' + user)
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			follow: function(user, callback) {
				return $http
					.post('/user/follow', {
						id: user
					})
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			},

			unfollow: function(user, callback) {
				return $http
					.post('/user/unfollow', {
						id: user
					})
					.success(callback)
					.error(function(err) {
						console.log(err);
					});
			}
		};
	}
]);
