'use strict';

//Global service for global variables
angular.module('mean.system').factory('User', ['$http',
	function($http) {
		return {
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
