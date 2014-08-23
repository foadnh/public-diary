'use strict';

angular.module('mean.system').controller('HeaderCtrl', ['$scope', '$rootScope', 'Global', 'Notifications', '$location',
	function($scope, $rootScope, Global, Notifications, $location) {
		$scope.global = Global;

		$scope.isCollapsed = false;

		$rootScope.$on('loggedin', function() {

			$scope.global = {
				authenticated: !!$rootScope.user,
				user: $rootScope.user
			};

			if ($scope.global.authenticated)
				Notifications.unreadCount(function(unreadCount) {
					$scope.notificationsUnreadCount = unreadCount;
				});
		});

		if (Global.authenticated)
			Notifications.unreadCount(function(unreadCount) {
				$scope.notificationsUnreadCount = unreadCount;
				console.log(unreadCount);
			});

		$scope.getNotifications = function() {
			Notifications.get(function(notifications) {
				$scope.notifications = notifications;
			});
		};

		$scope.search = function() {
			$location.path('/search/' + $scope.searchText);
		};
		$scope.searchTag = function() {
			var tag = $scope.searchText
				.toLowerCase()
				.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')
				.replace(/\s/g, '-');
			$location.path('/tag/' + tag);
		};

	}
]);
