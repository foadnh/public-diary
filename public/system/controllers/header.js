'use strict';

angular.module('mean.system').controller('HeaderCtrl', ['$scope', '$rootScope', 'Global', '$location',
	function($scope, $rootScope, Global, $location) {
		$scope.global = Global;

		$scope.isCollapsed = false;

		$rootScope.$on('loggedin', function() {

			$scope.global = {
				authenticated: !! $rootScope.user,
				user: $rootScope.user
			};
		});

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
