'use strict';

angular.module('mean.system').controller('HeaderCtrl', ['$scope', '$rootScope', 'Global', 'Menus', '$location',
	function($scope, $rootScope, Global, Menus, $location) {
		$scope.global = Global;
		$scope.menus = {};

		// Default hard coded menu items for main menu
		var defaultMainMenu = [];

		// Query menus added by modules. Only returns menus that user is allowed to see.
		function queryMenu(name, defaultMenu) {

			Menus.query({
				name: name,
				defaultMenu: defaultMenu
			}, function(menu) {
				$scope.menus[name] = menu;
			});
		}

		// Query server for menus and check permissions
		queryMenu('main', defaultMainMenu);

		$scope.isCollapsed = false;

		$rootScope.$on('loggedin', function() {

			queryMenu('main', defaultMainMenu);

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
