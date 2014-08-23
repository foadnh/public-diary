'use strict';

angular.module('mean.system').directive('notifications', ['$state', 'Notifications',
	function($state, Notifications) {
		return {
			scope: {
				source: '=model',
				unreadCount: '=unreadCount'
			},
			restrict: 'E',
			replace: true,
			templateUrl: 'public/system/views/directives/notifications.html',
			controller: function($scope) {
				$scope.$watch('source', function(newValue, oldValue) {
					$scope.notifications = [];
					if (newValue) {
						var grouped = _.groupBy(newValue, function(notification) {
							return [
								notification.type,
								notification.refer
							];
						});
						_.each(grouped, function(notification, key) {
							switch (key.split(',')[0]) {
								case 'vote':
									var result = {
										read: notification[0].read,
										link: $state.href('diary', {
											diaryId: notification[0].refer
										}),
										key: key
									};
									if (notification.length === 1)
										result.text = 'Your diary is liked';
									else
										result.text = 'Your diary is liked ' + notification.length + ' times';

									$scope.notifications.push(result);
									break;
								case 'follow':
									$scope.notifications.push({
										text: 'Your are followed',
										read: notification[0].read,
										link: $state.href('user', {
											user: notification[0].refer
										}),
										key: key
									});
									break;
							}
						});
					}
				});
				$scope.markAsRead = function(read, key, index) {
					if (!read) {
						var splitted = key.split(',');
						Notifications.read({
							type: splitted[0],
							refer: splitted[1]
						}, function() {
							$scope.unreadCount--;
							$scope.notifications[index].read = true;
						});
					}
				};
			},
		};
	}
]);
